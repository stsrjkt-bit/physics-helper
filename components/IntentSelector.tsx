import React from 'react';
import { type IntentType } from '../types';

interface IntentSelectorProps {
    selectedIntent: IntentType | null;
    onSelectIntent: (intent: IntentType) => void;
}

const INTENTS: {
    key: IntentType;
    label: string;
    description: string;
}[] = [
    { key: 'check_mistake', label: 'ミスをチェックしてほしい', description: '自分のノートの計算ミスや考え方の間違いを見つけます。' },
    { key: 'explain_solution', label: 'この解説を説明してほしい', description: '模範解答や解説で、分からない箇所を分かりやすく説明します。' },
    { key: 'validate_approach', label: 'この方針で良いか見てほしい', description: '自分の解き方が正しいか、もっと良い方法がないか確認します。' },
    { key: 'teach_method', label: '解き方を教えてほしい', description: '問題の考え方と、解くための手順をステップバイステップで解説します。' },
    { key: 'continue_stuck', label: '詰まった所の続きを教えてほしい', description: 'どこで手が止まったか分析し、次のステップへのヒントを出します。' },
];

const IntentSelector: React.FC<IntentSelectorProps> = ({ selectedIntent, onSelectIntent }) => {
    return (
        <div className="w-full p-4 sm:p-6 bg-gray-100 dark:bg-gray-900/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">何を手伝ってほしい？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTENTS.map(({ key, label, description }) => {
                    const isSelected = selectedIntent === key;
                    const baseClasses = "p-4 w-full text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02]";
                    const selectedClasses = "bg-blue-100 dark:bg-blue-900/50 border-blue-500 shadow-md";
                    const unselectedClasses = "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500";
                    
                    return (
                        <button
                            key={key}
                            onClick={() => onSelectIntent(key)}
                            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
                        >
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default IntentSelector;