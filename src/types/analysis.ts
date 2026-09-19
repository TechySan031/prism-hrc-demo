// Analysis and AI types

export interface AnalysisScore {
  category: string;
  score: number;
  maxScore: number;
  label: string;
  description: string;
}

export interface AnalysisRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  section: string;
  title: string;
  explanation: string;
  suggestedAction: string;
  suggestedText?: string;
  originalText?: string;
  applied: boolean;
}

export interface AnalysisReport {
  id: string;
  resumeId: string;
  resumeTitle: string;
  createdAt: string;
  overallScore: number;
  scores: AnalysisScore[];
  strengths: string[];
  recommendations: AnalysisRecommendation[];
  missingInfo: MissingInfoQuestion[];
  keywords: KeywordMatch[];
  formattingWarnings: string[];
}

export interface MissingInfoQuestion {
  id: string;
  question: string;
  context: string;
  section: string;
  answer: string;
  status: 'pending' | 'answered' | 'skipped' | 'unknown';
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  section?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface AIRewriteSuggestion {
  id: string;
  field: string;
  original: string;
  suggested: string;
  explanation: string;
  action: 'improve' | 'concise' | 'achievement' | 'grammar' | 'tailor';
  status: 'pending' | 'applied' | 'rejected';
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  savedAt: string;
}

export interface JobMatchResult {
  jobDescription: JobDescription;
  overallMatch: number;
  matchedSkills: SkillMatchItem[];
  missingSkills: SkillMatchItem[];
  relevantExperience: string[];
  suggestions: string[];
  warnings: string[];
}

export interface SkillMatchItem {
  skill: string;
  found: boolean;
  section?: string;
  confidence: 'high' | 'medium' | 'low';
}
