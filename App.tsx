import React, { useState } from 'react';
import IntentSelector from './components/IntentSelector';
import MultiImageUploader from './components/MultiImageUploader';
import AnalysisResultComponent from './components/AnalysisResult';
import { analyzePhysicsNote } from './services/geminiService';
import { type IntentType, type UploadedImages, type AnalysisResult } from './types';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [selectedIntent, setSelectedIntent] = useState<IntentType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIntentSelect = (intent: IntentType) => {
    setSelectedIntent(intent);
    setResult(null); // Clear previous results when intent changes
    setError(null);
  };

  const handleImagesReady = async (images: UploadedImages) => {
    if (!selectedIntent) {
      setError('分析の目的（何を手伝ってほしいか）を選択してください。');
      return;
    };

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzePhysicsNote(images, selectedIntent);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedIntent(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <header>
        <h1>📚 物理問題お助けAI</h1>
        <p>計算ミス・解説理解・解法確認</p>
      </header>

      <main>
        {isAnalyzing ? (
            <div className="analyzing">
                <Loader />
                <h2>分析中...</h2>
                <p>少々お待ちください (通常10-30秒程度)</p>
            </div>
        ) : result ? (
          <>
            <AnalysisResultComponent result={result} />
            <button className="reset-button" onClick={handleReset}>
              📷 別の問題を分析する
            </button>
          </>
        ) : (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <IntentSelector
              selectedIntent={selectedIntent}
              onSelectIntent={handleIntentSelect}
            />

            {selectedIntent && (
              <div style={{marginTop: '2rem', width: '100%'}}>
                <MultiImageUploader
                    onImagesReady={handleImagesReady}
                    disabled={isAnalyzing}
                />
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
