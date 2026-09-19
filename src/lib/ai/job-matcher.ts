import { ResumeContent } from '@/types/resume-schema';
import { AIProvider, JobMatchResponse, JobMatchResponseSchema } from './types';

export async function matchResumeToJobDescription(
  resume: ResumeContent,
  jobDescription: string,
  aiProvider?: AIProvider
): Promise<JobMatchResponse> {
  if (!aiProvider) {
    const { getAIProvider } = await import('./provider');
    aiProvider = getAIProvider();
  }

  const prompt = `Analyze this candidate's verified resume against the target job description.

CANDIDATE RESUME:
${JSON.stringify(resume, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS & FACTUALITY GUARDRAILS:
1. Identify MATCHED SKILLS: Hard and soft skills explicitly present in both the resume and JD.
2. Identify UNVERIFIED SKILLS: Skills hinted at by project context but not explicitly stated as verified competencies.
3. Identify MISSING SKILLS: Critical JD requirements that do NOT appear anywhere in the resume. DO NOT claim the candidate possesses them.
4. Calculate a realistic Match Score (0-100) based on keyword overlap, experience depth, and requirement coverage.
5. Provide high-value tailoring advice on phrasing and keyword positioning without fabricating experience.

Output strictly valid JSON matching JobMatchResponseSchema.`;

  return aiProvider.generateStructuredOutput(prompt, JobMatchResponseSchema);
}
