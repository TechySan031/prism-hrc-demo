import { z } from 'zod';
import { AIProvider, FullAnalysis, RewriteResponse, JobMatchResponse } from './types';

export class DeterministicFallbackAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    return `Analysis based on standard resume guidelines: ${prompt.slice(0, 100)}...`;
  }

  async generateStructuredOutput<T>(_prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    // Deterministic fallback response when explicitly opted in via AI_FALLBACK_ENABLED=true
    const fallbackData: FullAnalysis = {
      overallScore: 82,
      scores: [
        { category: 'ATS Compatibility', score: 88, maxScore: 100, status: 'good', details: 'Clean single-column structure parsed effectively.' },
        { category: 'Structure', score: 85, maxScore: 100, status: 'good', details: 'Clear chronological order and section headers.' },
        { category: 'Summary', score: 78, maxScore: 100, status: 'needs_improvement', details: 'Add more emphasis on target role leadership.' },
        { category: 'Experience', score: 84, maxScore: 100, status: 'good', details: 'Active bullet points across positions.' },
        { category: 'Achievements', score: 72, maxScore: 100, status: 'needs_improvement', details: 'Quantify metrics with verified real numbers.' },
        { category: 'Skills', score: 90, maxScore: 100, status: 'good', details: 'Relevant core competencies detected.' },
        { category: 'Keywords', score: 80, maxScore: 100, status: 'good', details: 'Aligned with industry standards.' },
        { category: 'Education', score: 95, maxScore: 100, status: 'good', details: 'Degrees and institutions listed clearly.' },
        { category: 'Projects', score: 80, maxScore: 100, status: 'good', details: 'Technical implementations highlighted.' },
        { category: 'Certifications', score: 85, maxScore: 100, status: 'good', details: 'Accredited credentials detected.' },
        { category: 'Readability', score: 90, maxScore: 100, status: 'good', details: 'High clarity and concise phrasing.' },
        { category: 'Formatting', score: 88, maxScore: 100, status: 'good', details: 'No parsing risks or broken elements.' },
      ],
      strengths: [
        'Clear chronological trajectory with designated title hierarchy',
        'Strong action verbs in primary employment responsibilities',
        'Concise section divisions compatible with ATS parsing algorithms',
      ],
      recommendations: [
        {
          id: 'rec-1',
          priority: 'high',
          section: 'experience',
          problem: 'Accomplishment bullet lacks measurable outcome',
          explanation: 'Adding verified real metrics (e.g. latency reduced, team size, budget) substantially increases recruiter engagement.',
          suggestedAction: 'Add the actual measurable outcome or metric achieved in your most recent role.',
          evidenceUsed: 'Experience section bullets',
          confidence: 0.95,
          requiresUserConfirmation: true,
        },
        {
          id: 'rec-2',
          priority: 'medium',
          section: 'summary',
          problem: 'Summary is somewhat generic',
          explanation: 'Highlight your top domain specialization and primary technologies in the first sentence.',
          suggestedAction: 'Tailor the first sentence to your target senior title and core stack.',
          evidenceUsed: 'Professional summary',
          confidence: 0.9,
          requiresUserConfirmation: true,
        },
      ],
      missingInfo: [
        {
          id: 'q-1',
          section: 'experience',
          question: 'What was the quantifiable outcome or scale of your primary project?',
          context: 'Most recent role',
          status: 'pending',
        },
      ],
      summaryEvaluation: 'Strong foundational profile. Adding verified metrics and targeted role alignment will maximize ATS ranking.',
    };

    // If requesting rewrite or job match, return valid matching structure
    try {
      return schema.parse(fallbackData);
    } catch {
      const rewriteFallback: RewriteResponse = {
        original: 'Responsible for leading development and maintenance.',
        suggested: 'Spearheaded end-to-end development and continuous maintenance of core systems.',
        explanation: 'Strengthened initial verb to active leadership voice without adding unverified claims.',
        action: 'improve_wording',
      };
      try {
        return schema.parse(rewriteFallback);
      } catch {
        const jobMatchFallback: JobMatchResponse = {
          matchScore: 84,
          matchedSkills: ['System Design', 'TypeScript', 'Node.js', 'PostgreSQL'],
          unverifiedSkills: ['Kubernetes', 'GraphQL'],
          missingSkills: ['Terraform'],
          matchedKeywords: ['Full Stack', 'Agile', 'Microservices'],
          relevantExperienceHighlights: ['Led full-stack architecture migration'],
          potentialGaps: ['Cloud infrastructure automation tooling'],
          tailoringAdvice: ['Highlight hands-on cloud deployment experience in your summary.'],
        };
        return schema.parse(jobMatchFallback);
      }
    }
  }
}
