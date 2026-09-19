import { z } from 'zod';

export class AIConfigurationError extends Error {
  constructor(message = 'AI provider is not configured. Please configure AI_API_KEY in your environment variables.') {
    super(message);
    this.name = 'AIConfigurationError';
  }
}

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructuredOutput<T>(prompt: string, schema: z.ZodSchema<T>, systemPrompt?: string): Promise<T>;
}

export const CategoryScoreSchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  maxScore: z.number().default(100),
  status: z.enum(['good', 'needs_improvement', 'critical']),
  details: z.string(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  section: z.string(),
  problem: z.string(),
  explanation: z.string(),
  suggestedAction: z.string(),
  originalText: z.string().optional(),
  suggestedText: z.string().optional(),
  evidenceUsed: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.9),
  requiresUserConfirmation: z.boolean().default(true),
});

export const MissingInfoQuestionSchema = z.object({
  id: z.string(),
  section: z.string(),
  question: z.string(),
  context: z.string(),
  suggestedFormat: z.string().optional(),
  answer: z.string().optional(),
  status: z.enum(['pending', 'answered', 'skipped', 'unknown']).default('pending'),
});

export const FullAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.array(CategoryScoreSchema),
  strengths: z.array(z.string()),
  recommendations: z.array(RecommendationSchema),
  missingInfo: z.array(MissingInfoQuestionSchema),
  summaryEvaluation: z.string(),
});

export type FullAnalysis = z.infer<typeof FullAnalysisSchema>;

export const RewriteResponseSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  explanation: z.string(),
  action: z.enum(['improve_wording', 'make_concise', 'improve_grammar', 'make_achievement_oriented', 'tailor_to_job']),
  missingInformationPrompt: z.string().optional(),
});

export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;

export const JobMatchResponseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  unverifiedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  relevantExperienceHighlights: z.array(z.string()),
  potentialGaps: z.array(z.string()),
  tailoringAdvice: z.array(z.string()),
});

export type JobMatchResponse = z.infer<typeof JobMatchResponseSchema>;
