import { ResumeContent } from '@/types/resume-schema';
import { FullAnalysis, FullAnalysisSchema, AIProvider } from './types';

/**
 * Prism HRC Scoring Methodology:
 * 
 * 1. ATS Compatibility (15%):
 *    - Standard headings, no complex tables/textboxes, clean email/phone detection.
 * 2. Structure & Hierarchy (10%):
 *    - Presence and logical ordering of mandatory sections (Contact, Summary, Experience, Education, Skills).
 * 3. Professional Summary (5%):
 *    - Focused, 30-100 words, clearly articulating target role and domain expertise.
 * 4. Experience & Career Trajectory (20%):
 *    - Chronological continuity, job titles, active verbs starting every bullet.
 * 5. Achievement Quality & Metrics (15%):
 *    - Presence of verified numerical evidence (%, $, scale, velocity, counts).
 * 6. Skills & Relevance (10%):
 *    - Grouped skill taxonomies, verified competencies.
 * 7. Keywords Alignment (5%):
 *    - Density of recognized technical and professional domain keywords.
 * 8. Education & Certifications (5%):
 *    - Accredited degrees, graduation dates, accredited credentials.
 * 9. Projects & Applied Evidence (5%):
 *    - Production or portfolio implementations with specified tech stack.
 * 10. Readability & Formatting (10%):
 *    - Optimal bullet length (1-3 lines), grammatical precision, absence of passive voice.
 */

export interface DeterministicEvaluation {
  hasEmail: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  hasSummary: boolean;
  summaryWordCount: number;
  experienceCount: number;
  totalBullets: number;
  metricsCount: number;
  actionVerbCount: number;
  hasEducation: boolean;
  hasSkills: boolean;
  skillCount: number;
  deterministicScore: number;
}

export function evaluateDeterministicRules(resume: ResumeContent): DeterministicEvaluation {
  const p = resume.personal || {};
  const hasEmail = Boolean(p.email && p.email.includes('@'));
  const hasPhone = Boolean(p.phone && p.phone.length >= 7);
  const hasLocation = Boolean(p.location && p.location.length > 2);

  const summary = resume.summary || '';
  const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
  const hasSummary = summaryWordCount >= 15;

  const experience = resume.experience || [];
  const experienceCount = experience.length;

  let totalBullets = 0;
  let metricsCount = 0;
  let actionVerbCount = 0;

  const actionVerbs = new Set([
    'accelerated', 'achieved', 'architected', 'built', 'championed', 'created',
    'delivered', 'designed', 'developed', 'directed', 'engineered', 'established',
    'executed', 'expanded', 'generated', 'guided', 'implemented', 'improved',
    'increased', 'launched', 'led', 'managed', 'maximized', 'mentored', 'negotiated',
    'orchestrated', 'optimized', 'pioneered', 'reduced', 'revamped', 'scaled',
    'spearheaded', 'streamlined', 'transformed',
  ]);

  const metricRegex = /\b(?:\d+[%kKmMbB]?|\$\d+|\d+\+?)\b/;

  for (const exp of experience) {
    for (const bullet of exp.bullets || []) {
      totalBullets++;
      if (metricRegex.test(bullet)) {
        metricsCount++;
      }
      const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (firstWord && actionVerbs.has(firstWord)) {
        actionVerbCount++;
      }
    }
  }

  const education = resume.education || [];
  const hasEducation = education.length > 0;

  const skills = resume.skills || [];
  let skillCount = 0;
  for (const cat of skills) {
    skillCount += cat.skills?.length || 0;
  }
  const hasSkills = skillCount >= 4;

  // Calculate base score out of 50
  let baseScore = 0;
  if (hasEmail) baseScore += 5;
  if (hasPhone) baseScore += 4;
  if (hasLocation) baseScore += 3;
  if (hasSummary && summaryWordCount <= 120) baseScore += 6;
  if (experienceCount >= 1) baseScore += 8;
  if (totalBullets >= 4) baseScore += 6;
  if (metricsCount >= 2) baseScore += 6;
  if (actionVerbCount >= 3) baseScore += 4;
  if (hasEducation) baseScore += 4;
  if (hasSkills) baseScore += 4;

  return {
    hasEmail,
    hasPhone,
    hasLocation,
    hasSummary,
    summaryWordCount,
    experienceCount,
    totalBullets,
    metricsCount,
    actionVerbCount,
    hasEducation,
    hasSkills,
    skillCount,
    deterministicScore: Math.min(50, baseScore),
  };
}

export async function runResumeAnalysis(
  resume: ResumeContent,
  aiProvider: AIProvider
): Promise<FullAnalysis> {
  const deterministic = evaluateDeterministicRules(resume);

  const prompt = `Perform a comprehensive, rigorous ATS and career readiness analysis for this resume.

RESUME CONTENT:
${JSON.stringify(resume, null, 2)}

DETERMINISTIC METRICS DETECTED:
- Email Present: ${deterministic.hasEmail}
- Phone Present: ${deterministic.hasPhone}
- Location Present: ${deterministic.hasLocation}
- Summary Words: ${deterministic.summaryWordCount}
- Work Positions: ${deterministic.experienceCount}
- Total Bullets: ${deterministic.totalBullets}
- Bullets with Verifiable Metrics: ${deterministic.metricsCount}
- Bullets Starting with Action Verbs: ${deterministic.actionVerbCount}
- Education Entries: ${resume.education?.length || 0}
- Total Skills Listed: ${deterministic.skillCount}
- Base Deterministic Score: ${deterministic.deterministicScore} / 50

INSTRUCTIONS:
1. Provide qualitative scores for each of the 12 categories (0-100 scale).
2. Calculate overallScore (0-100) combining the deterministic foundation with qualitative depth.
3. Identify 3-5 real concrete strengths.
4. Identify 3-6 actionable recommendations.
   - For every recommendation, specify section, problem, explanation, suggestedAction, evidenceUsed, confidence, and requiresUserConfirmation.
   - If suggesting an improved bullet or summary, DO NOT invent metrics or employers. Use placeholders like "[insert percentage]" if the user has not verified the number.
5. Generate 2-4 missing-information questions to help the candidate quantify their actual unstated accomplishments.

Output strictly valid JSON matching FullAnalysisSchema.`;

  return aiProvider.generateStructuredOutput(prompt, FullAnalysisSchema);
}
