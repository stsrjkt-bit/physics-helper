// components/IntentSelector.tsx - 全文コピペ用
import React from 'react';
import { type IntentType, type IntentOption } from '../types';

const INTENT_OPTIONS: IntentOption[] = [
  {
    type: 'check_mistake',
    icon: '🔍',
    label: 'ミスをチェック',
    description: '自分のノートの計算ミスや考え方の間違いを見つけます',
  },
  {
    type: 'explain_solution',
    icon: '💡',
    label: '解説を説明して',
    description: '模範解答や解説で、分からない部分を分かりやすく説明します',
  },
  {
    type: 'validate_approach',
    icon: '✅',
    label: 'この方法で良い?',
    description: '自分の解き方が正しいか、もっと良い方法がないか確認します',
  },
  {
    type: 'teach_method',
    icon: '📚',
    label: '解き方を教えて',
    description: '問題の解き方を、手順を追って丁寧に解説します',
  },
  {
    type: 'partial_credit_check',
    icon: '📝',
    label: '部分点もらえる?',
    description: '答案の記述で何点取れそうか、改善点と合わせて判定します',
  },
  {
    type: 'continue_stuck',
    icon: '🤔',
    label: '詰まった…',
    description: 'どこで手が止まったか分析し、次のステップへのヒントを出します',
  },
];

interface IntentSelectorProps {
  selectedIntent: IntentType | null;
  onSelectIntent: (intent: IntentType) => void;
}

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        何を手伝ってほしい?
      </h2>
      
      <div className="flex flex-col gap-3">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option.type}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200
              flex items-start gap-4 text-left
              ${selectedIntent === option.type
                ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-1'
              }
            `}
            onClick={() => onSelectIntent(option.type)}
          >
            <div className="text-3xl flex-shrink-0">{option.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                {option.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
