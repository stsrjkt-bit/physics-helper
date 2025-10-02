export type IntentType =
  | 'check_mistake'
  | 'explain_solution'
  | 'validate_approach'
  | 'teach_method'
  | 'continue_stuck';

export interface UploadedImages {
  problem?: string;
  solution?: string;
  studentWork?: string;
}

export interface AnalysisResult {
  intentType: IntentType;
  hasError: boolean;
  errorLocation: string;
  errorExplanation: string;
  correctiveSuggestion: string;
}
