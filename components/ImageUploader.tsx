import React, { useState } from 'react';
import { type UploadedImages } from '../types';

interface MultiImageUploaderProps {
  onImagesReady: (images: UploadedImages) => void;
  disabled?: boolean;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  onImagesReady,
  disabled = false,
}) => {
  const [images, setImages] = useState<UploadedImages>({});

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof UploadedImages
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます（10MB以下にしてください）');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImages((prev) => ({ ...prev, [type]: base64 }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = (type: keyof UploadedImages) => {
    setImages((prev) => {
      const newImages = { ...prev };
      delete newImages[type];
      return newImages;
    });
  };

  const hasAnyImage = Object.keys(images).length > 0;

  return (
    <div className="multi-image-uploader">
      <h3>写真を追加してください</h3>
      <p className="upload-hint">
        問題、解答、ノートが別々の場合は複数枚アップできます
      </p>

      <div className="upload-sections">
        {/* 問題文 */}
        <div className="upload-section">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'problem')}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            {!images.problem ? (
              <div className="upload-button">
                <span className="upload-icon">📸</span>
                <span className="upload-text">問題文を撮る</span>
                <span className="upload-badge optional">任意</span>
              </div>
            ) : (
              <div className="uploaded-preview">
                <img src={images.problem} alt="問題文" />
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove('problem');
                  }}
                  aria-label="Remove problem image"
                >
                  ✕
                </button>
                <span className="image-label">問題文</span>
              </div>
            )}
          </label>
        </div>

        {/* 解答・解説 */}
        <div className="upload-section">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'solution')}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            {!images.solution ? (
              <div className="upload-button">
                <span className="upload-icon">📸</span>
                <span className="upload-text">解答・解説を撮る</span>
                <span className="upload-badge optional">任意</span>
              </div>
            ) : (
              <div className="uploaded-preview">
                <img src={images.solution} alt="解答・解説" />
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove('solution');
                  }}
                  aria-label="Remove solution image"
                >
                  ✕
                </button>
                <span className="image-label">解答・解説</span>
              </div>
            )}
          </label>
        </div>

        {/* 自分のノート */}
        <div className="upload-section">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'studentWork')}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            {!images.studentWork ? (
              <div className="upload-button">
                <span className="upload-icon">📸</span>
                <span className="upload-text">自分のノートを撮る</span>
                <span className="upload-badge optional">任意</span>
              </div>
            ) : (
              <div className="uploaded-preview">
                <img src={images.studentWork} alt="自分のノート" />
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove('studentWork');
                  }}
                  aria-label="Remove student work image"
                >
                  ✕
                </button>
                <span className="image-label">自分のノート</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        className="analyze-button"
        disabled={!hasAnyImage || disabled}
        onClick={() => onImagesReady(images)}
      >
        <span>🔍</span>
        <span>分析開始</span>
      </button>

      {!hasAnyImage && !disabled && (
        <p className="no-image-hint">少なくとも1枚の写真が必要です</p>
      )}
    </div>
  );
};

export default MultiImageUploader;
