import { GoogleGenAI, Type } from "@google/genai";
import { type AnalysisResult, type UploadedImages, type IntentType } from '../types';
import { optimizeImage } from '../utils/imageUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const generatePrompt = (intent: IntentType, providedMaterials: string): string => {
  const baseInstruction = `あなたは日本の高校生のための優秀な物理の家庭教師です。\n\n生徒から複数の画像が送られてきます:\n${providedMaterials}\n\n`;

  let specificInstruction = '';

  switch (intent) {
    case 'check_mistake':
      specificInstruction = `
<役割>
生徒は自分で解いた問題の計算ミスをチェックしてほしいと思っています。

<あなたがすべきこと>
1. 計算過程を丁寧に追う
2. ミスがあれば具体的に指摘する
3. なぜそれがミスなのか、物理的・数学的に説明する
4. 同じミスを防ぐための実践的なアドバイスをする
5. ミスがなければ心から褒め、発展的な視点を提供する

<特に注意してチェックする点>
- 符号のミス（座標系の設定を確認）
- 単位の換算ミス（m↔cm, kg↔g等）
- 公式の適用条件
- 有効数字の処理
- 計算の論理的な流れ

JSON形式で回答:
{
  "intentType": "check_mistake",
  "hasError": true または false,
  "errorLocation": "ミスの具体的な場所（例: 3行目の運動方程式）。ミスがない場合は空文字列",
  "errorExplanation": "なぜミスなのか、物理的・数学的に丁寧に説明。ミスがない場合は空文字列",
  "correctiveSuggestion": "より良い解法や防止策。ミスがない場合は賞賛と発展的アドバイス"
}`;
      break;

    case 'explain_solution':
      specificInstruction = `
<役割>
生徒は模範解答や解説の一部が理解できず、説明してほしいと思っています。

<あなたがすべきこと>
1. 画像から、どの部分が分からないのか特定する（赤線、マーカー、疑問符等に注目）
2. その部分を高校生が理解できる言葉で噛み砕いて説明する
3. なぜそうなるのか、物理的な背景や意味を説明する
4. 関連する概念や公式も補足する
5. 理解を深めるための確認質問を添える

<説明のポイント>
- 専門用語は最小限に、使う場合は定義も示す
- 具体例や図的なイメージを添える
- 「なぜ」を大切に説明する
- 威圧的にならず、励ましながら

JSON形式で回答:
{
  "intentType": "explain_solution",
  "hasError": false,
  "errorLocation": "",
  "errorExplanation": "分からなかった部分の詳しい解説",
  "correctiveSuggestion": "理解を深めるためのアドバイスと確認のための質問"
}`;
      break;

    case 'validate_approach':
      specificInstruction = `
<役割>
生徒は自分なりの解法で解いていて、それが物理的に正しいか確認したいと思っています。

<あなたがすべきこと>
1. 生徒の解法を丁寧に読み取り、理解する
2. その解法が物理的に正しいか検証する
3. 正しい場合:
   - 具体的に褒める
   - 工夫している点を評価する
   - さらに効率的な方法があれば紹介する
4. 問題がある場合:
   - 優しく指摘する
   - なぜ問題なのか説明する
   - 正しい方向へ導く

<評価のポイント>
- 物理法則に従っているか
- 数式の展開は正しいか
- 単位は一貫しているか
- 解法の効率性

JSON形式で回答:
{
  "intentType": "validate_approach",
  "hasError": true または false（物理的誤りがあるか）,
  "errorLocation": "問題がある箇所。正しい場合は空文字列",
  "errorExplanation": "どこがどう良い/問題があるかの説明",
  "correctiveSuggestion": "改善点や別解の提案。正しい場合は更なる工夫の提案"
}`;
      break;

    case 'teach_method':
      specificInstruction = `
<役割>
生徒は問題の解き方が分からず、教えてほしいと思っています。

<あなたがすべきこと>
1. 問題文を読み取る
2. 解法の方針を示す（どの物理法則を使うか等）
3. ステップバイステップで解き方を解説する
4. 各ステップの物理的意味を説明する
5. 最後は生徒が自分で解けるよう、ヒントを残す

<重要な注意点>
- 答えを丸々教えるのではなく、「考え方」を教える
- 途中で「ここまで分かる?」的な確認を入れる
- 公式を使う場合、なぜその公式を使うのか説明する
- 最終的な答えは示さず、「あとは計算するだけ」で止める

<教え方のコツ>
- 段階的に
- 丁寧に
- 励ましながら
- 自力で解く達成感を奪わない

JSON形式で回答:
{
  "intentType": "teach_method",
  "hasError": false,
  "errorLocation": "",
  "errorExplanation": "問題の解き方をステップバイステップで（答えは示さない）",
  "correctiveSuggestion": "自分で解くためのヒントと、類似問題への取り組み方"
}`;
      break;

    case 'continue_stuck':
      specificInstruction = `
<役割>
生徒は問題を途中まで解いたが、そこから先が分からなくなっています。

<あなたがすべきこと>
1. 生徒がどこまで解けているか確認する
2. その部分が正しいか検証する
3. なぜそこで詰まったのか分析する
4. 次のステップへのヒントを出す（答えは言わない）
5. 自力で解く達成感を大切にする

<ヒントの出し方>
- 「次はどの物理量に注目すればいい?」
- 「この状況で使える公式は?」
- 「座標系はどう設定した?」
など、考えるきっかけを与える

<避けるべきこと>
- 答えを直接教える
- 次の式を完全に示す
- 詰まった原因を決めつける

JSON形式で回答:
{
  "intentType": "continue_stuck",
  "hasError": false,
  "errorLocation": "詰まっている箇所",
  "errorExplanation": "なぜそこで詰まったのか、何を考えるべきか",
  "correctiveSuggestion": "続きを解くためのヒントと考え方（答えは示さない）"
}`;
      break;

    case 'partial_credit_check':
      specificInstruction = `
<役割>
あなたは国公立大学2次試験の採点経験がある物理の教員です。
生徒は自分の答案で部分点がもらえるか不安に思っています。

<採点基準の理解>
国公立2次試験の記述式では:
1. 方針点: 正しい物理法則・公式を選択（30-40%）
2. 式の立て方: 必要な式を正確に記述（20-30%）
3. 計算過程: 論理的な式変形（10-20%）
4. 最終解答: 数値と単位の正確性（20-30%）
5. 図示: 適切な図・グラフ（加点要素）

<分析内容>
1. 答案がどこまで到達しているか段階評価
2. 各採点項目での推定得点
3. 部分点獲得のために不足している要素
4. 「ここまで書けば○割確保」という具体的な見通し
5. 採点者視点での改善ポイント

JSON形式で回答:
{
  "intentType": "partial_credit_check",
  "hasError": false,
  "errorLocation": "到達している段階",
  "errorExplanation": "現時点での推定得点と評価",
  "correctiveSuggestion": "部分点を取るための改善策"
}`;
      break;
  }

  return baseInstruction + specificInstruction;
};

const safeParseJsonResponse = (rawText: string): any => {
    const cleanedText = rawText.trim().replace(/^```(?:json)?\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse JSON response content:", cleanedText);
        throw new Error("APIから無効なJSON形式の応答がありました。");
    }
};

const schema = {
  type: Type.OBJECT,
  properties: {
    intentType: {
      type: Type.STRING,
      description: '生徒が選択した意図。',
    },
    hasError: {
      type: Type.BOOLEAN,
      description: '計算ミスや概念の間違いがあったかどうか。',
    },
    errorLocation: {
      type: Type.STRING,
      description: 'ミスの具体的な場所。ミスがない場合は空文字列。',
    },
    errorExplanation: {
      type: Type.STRING,
      description: 'なぜミスなのか、物理的・数学的に丁寧に説明。',
    },
    correctiveSuggestion: {
      type: Type.STRING,
      description: 'より良い解法、防止策、賞賛、発展的アドバイスなど。',
    },
  },
  required: ['intentType', 'hasError', 'errorLocation', 'errorExplanation', 'correctiveSuggestion'],
};

export const analyzePhysicsNote = async (
  images: UploadedImages,
  intent: IntentType
): Promise<AnalysisResult> => {
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];

  const providedMaterials = [
      images.problem && "- 問題文の画像",
      images.solution && "- 模範解答・解説の画像",
      images.studentWork && "- 生徒のノートの画像"
  ].filter(Boolean).join("\n");

  const prompt = generatePrompt(intent, providedMaterials);
  parts.push({ text: prompt });

  const imageProcessingPromises = Object.entries(images).map(async ([key, rawBase64]) => {
      if (rawBase64) {
          const optimized = await optimizeImage(rawBase64);
          return {
              key: key as keyof UploadedImages,
              data: optimized.split(',')[1],
              mimeType: 'image/jpeg'
          };
      }
      return null;
  });

  const processedImages = (await Promise.all(imageProcessingPromises)).filter(Boolean);

  for (const img of processedImages) {
    if (img) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.data }
      });
    }
  }

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
          config: {
              responseMimeType: "application/json",
              responseSchema: schema,
              temperature: 0.4,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 8192,
          },
      });

      const parsedJson = safeParseJsonResponse(response.text);
      
      if (parsedJson.intentType !== intent) {
          console.warn(
              `API returned mismatched intent. Expected: ${intent}, Got: ${parsedJson.intentType}. Overriding.`
          );
          parsedJson.intentType = intent;
      }

      if (
          typeof parsedJson.intentType === 'string' &&
          typeof parsedJson.hasError === 'boolean' &&
          typeof parsedJson.errorLocation === 'string' &&
          typeof parsedJson.errorExplanation === 'string' &&
          typeof parsedJson.correctiveSuggestion === 'string'
      ) {
          return parsedJson as AnalysisResult;
      } else {
          console.error("Invalid response format from API", parsedJson);
          throw new Error("APIから予期しない形式の応答がありました。");
      }
  } catch (error) {
      console.error("Error analyzing physics note:", error);
      if (error instanceof Error) {
        throw new Error(`Gemini APIとの通信に失敗しました: ${error.message}`);
      }
      throw new Error("Gemini APIとの通信中に不明なエラーが発生しました。");
  }
};
