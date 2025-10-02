import React from 'react';
import { type AnalysisResult } from '../types';
import { CheckCircleIcon, LightBulbIcon, ExclamationTriangleIcon } from './icons';

const AnalysisResultComponent: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const { hasError, errorLocation, errorExplanation, correctiveSuggestion } = result;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">分析結果</h2>
      
        {hasError ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-200">計算ミスが見つかりました</h3>
                        <div className="mt-2 text-md text-red-700 dark:text-red-300 space-y-3">
                            <div>
                                <p className="font-semibold">ミスの箇所:</p>
                                <p className="whitespace-pre-wrap">{errorLocation || '特定できませんでした。'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">ミスの説明:</p>
                                <p className="whitespace-pre-wrap">{errorExplanation || '詳細な説明はありません。'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-200">素晴らしい！計算ミスは見つかりませんでした</h3>
                        <div className="mt-2 text-md text-green-700 dark:text-green-300 whitespace-pre-wrap">
                            <p>{correctiveSuggestion || "この調子で頑張りましょう！"}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {hasError && correctiveSuggestion && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <LightBulbIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">改善のヒント</h3>
                        <div className="mt-2 text-md text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                            <p>{correctiveSuggestion}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AnalysisResultComponent;
