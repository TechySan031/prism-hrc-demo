import { AIProvider, RewriteResponse, RewriteResponseSchema } from './types';

export async function rewriteResumeText(
  originalText: string,
  action: 'improve_wording' | 'make_concise' | 'improve_grammar' | 'make_achievement_oriented' | 'tailor_to_job',
  context?: {
    field?: string;
    roleTitle?: string;
    jobDescription?: string;
  },
  aiProvider?: AIProvider
): Promise<RewriteResponse> {
  if (!aiProvider) {
    const { getAIProvider } = await import('./provider');
    aiProvider = getAIProvider();
  }

  const actionGoals: Record<string, string> = {
    improve_wording: 'Enhance professional tone and vocabulary using strong active verbs while preserving all original facts.',
    make_concise: 'Eliminate filler words and redundancy to make the text compact and high-impact.',
    improve_grammar: 'Fix any grammatical, syntactic, or punctuation errors while preserving author voice.',
    make_achievement_oriented: 'Frame the contribution around business outcomes and value delivered. DO NOT INVENT NUMBERS. If metrics are missing, prompt the user.',
    tailor_to_job: `Align phrasing with relevant keywords from target job description (${context?.jobDescription?.slice(0, 300) || 'industry standards'}) without fabricating unverified competencies.`,
  };

  const prompt = `Rewrite the following resume text according to the specified goal.

ORIGINAL TEXT:
"${originalText}"

FIELD/SECTION: ${context?.field || 'General'}
TARGET ROLE: ${context?.roleTitle || 'Professional'}
REWRITE GOAL: ${actionGoals[action]}

CRITICAL FACTUALITY RULES:
1. NEVER invent employers, dates, metrics, percentages, dollar amounts, technologies, or degrees.
2. If the original text says "improved performance", DO NOT write "improved performance by 40%".
3. If an achievement would benefit from a metric the user did not provide, specify what to measure in the missingInformationPrompt field (e.g. "Add your team size or percentage improvement if known").

Return strictly valid JSON conforming to RewriteResponseSchema:
{
  "original": string,
  "suggested": string,
  "explanation": string,
  "action": "${action}",
  "missingInformationPrompt": optional string
}`;

  return aiProvider.generateStructuredOutput(prompt, RewriteResponseSchema);
}
