const MAX_DIMENSION = 2048;

/**
 * Decodes a base64 string into an ArrayBuffer.
 * @param base64 The base64 string.
 * @returns The decoded ArrayBuffer.
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};


/**
 * Reads the EXIF orientation tag from a JPEG image.
 * @param base64 The base64 encoded JPEG image.
 * @returns The orientation value (1-8), or 1 if not found or not a JPEG.
 */
const getOrientation = (base64: string): number => {
    try {
        const buffer = base64ToArrayBuffer(base64);
        const view = new DataView(buffer);

        if (view.getUint16(0, false) !== 0xFFD8) {
            return 1; // Not a valid JPEG
        }

        let length = view.byteLength;
        let offset = 2;

        while (offset < length) {
            const marker = view.getUint16(offset, false);
            offset += 2;

            if (marker === 0xFFE1) { // APP1 marker for EXIF
                // Check for "Exif" identifier
                if (view.getUint32(offset + 2, false) !== 0x45786966) {
                    return 1;
                }

                const little = view.getUint16(offset += 6, false) === 0x4949; // II for Intel (little-endian)
                offset += view.getUint32(offset + 4, little);
                const tags = view.getUint16(offset, little);
                offset += 2;

                for (let i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) === 0x0112) { // Orientation tag
                        return view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            } else if ((marker & 0xFF00) !== 0xFF00) {
                break; // Not a valid marker
            } else {
                offset += view.getUint16(offset, false); // Skip to the next marker
            }
        }
        return 1; // Orientation tag not found
    } catch (e) {
        console.warn("Could not read EXIF orientation, assuming 1.", e);
        return 1;
    }
};


/**
 * Optimizes an image by resizing and correcting its orientation based on EXIF data.
 * Includes robust error handling.
 * @param base64Image The base64 encoded image string.
 * @returns A promise that resolves to the optimized base64 image string.
 */
export const optimizeImage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64Image || typeof base64Image !== 'string') {
      return reject(new Error('Invalid base64 image string'));
    }

    const orientation = getOrientation(base64Image);

    const img = new Image();

    const timeout = setTimeout(() => {
      reject(new Error('Image loading timed out after 10 seconds.'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);

      if (img.width === 0 || img.height === 0) {
        return reject(new Error('Invalid image dimensions (0x0).'));
      }

      const originalWidth = img.width;
      const originalHeight = img.height;

      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      // Swap dimensions for orientations that involve 90-degree rotations
      if (orientation >= 5 && orientation <= 8) {
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      }

      // Calculate the resize ratio, ensuring it doesn't exceed MAX_DIMENSION and preserves aspect ratio
      const ratio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight, 1);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }

        // Transform the canvas context to account for EXIF orientation
        switch (orientation) {
          case 2: ctx.translate(targetWidth, 0); ctx.scale(-1, 1); break;
          case 3: ctx.translate(targetWidth, targetHeight); ctx.rotate(Math.PI); break;
          case 4: ctx.translate(0, targetHeight); ctx.scale(1, -1); break;
          case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break;
          case 6: ctx.rotate(0.5 * Math.PI); ctx.translate(0, -targetWidth); break;
          case 7: ctx.rotate(0.5 * Math.PI); ctx.translate(targetHeight, -targetWidth); ctx.scale(-1, 1); break;
          case 8: ctx.rotate(-0.5 * Math.PI); ctx.translate(-targetHeight, 0); break;
          default: // case 1: do nothing
        }

        // The drawing size must fill the logical canvas space before rotation
        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        if (orientation >= 5 && orientation <= 8) {
            [drawWidth, drawHeight] = [drawHeight, drawWidth];
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the image, scaling it to the calculated dimensions on the transformed canvas
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

        const optimized = canvas.toDataURL('image/jpeg', 0.95);
        resolve(optimized);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        reject(new Error(`Failed to process image on canvas: ${errorMessage}`));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load image. It might be corrupted or in an unsupported format.`));
    };

    img.src = base64Image;
  });
};
