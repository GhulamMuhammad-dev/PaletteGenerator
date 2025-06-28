export interface BrandStrategy {
  brandName: string;
  industry: string;
  targetAudience: string;
  brandPersonality: string[];
  values: string[];
  goals: string;
  competitors?: string;
  additionalContext?: string;
}

export interface AIColorSuggestion {
  colors: string[];
  reasoning: string;
  harmonyType: string;
  psychologyExplanation: string;
  brandAlignment: string;
  alternatives: {
    colors: string[];
    reason: string;
  }[];
}

export interface ColorPsychology {
  color: string;
  emotions: string[];
  associations: string[];
  industries: string[];
  culturalMeaning: string;
}

export interface AIAnalysis {
  suggestion: AIColorSuggestion;
  psychology: ColorPsychology[];
  confidence: number;
  recommendations: string[];
}