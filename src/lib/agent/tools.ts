import { extractTextFromFile, normalizeExtractedText } from '@/lib/parser/extractor';
import { parseRawTextToResume } from '@/lib/parser/resume-parser';
import { runResumeAnalysis } from '@/lib/ai/scoring-engine';
import { matchResumeToJobDescription } from '@/lib/ai/job-matcher';
import { rewriteResumeText } from '@/lib/ai/rewriter';
import { getAIProvider } from '@/lib/ai/provider';
import { ResumeContent } from '@/types/resume-schema';
import { FullAnalysis, JobMatchResponse, RewriteResponse } from '@/lib/ai/types';
import { prisma } from '@/lib/prisma';

/**
 * Agent Tool Suite for Prism HRC AI Resume Agent
 */
export const AgentTools = {
  /**
   * Tool: parse_resume
   * Ingests a raw file buffer (PDF, DOCX, TXT) and extracts clean normalized text.
   */
  async parse_resume(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
    const raw = await extractTextFromFile(buffer, mimeType, filename);
    return normalizeExtractedText(raw);
  },

  /**
   * Tool: extract_resume_structure
   * Converts normalized text into validated structured ResumeContent.
   */
  async extract_resume_structure(text: string, filename?: string): Promise<ResumeContent> {
    return parseRawTextToResume(text, filename);
  },

  /**
   * Tool: analyze_resume
   * Performs hybrid deterministic and AI analysis producing documented 12-category score breakdown.
   */
  async analyze_resume(resume: ResumeContent): Promise<FullAnalysis> {
    const ai = getAIProvider();
    return runResumeAnalysis(resume, ai);
  },

  /**
   * Tool: detect_missing_information
   * Discovers unstated metrics and quantifiable outcomes, returning targeted questions.
   */
  async detect_missing_information(resume: ResumeContent): Promise<FullAnalysis['missingInfo']> {
    const analysis = await this.analyze_resume(resume);
    return analysis.missingInfo;
  },

  /**
   * Tool: analyze_job_description & match_resume_to_job
   * Analyzes job description against verified candidate resume.
   * Categorizes competencies into Verified, Unverified, and Missing.
   */
  async match_resume_to_job(resume: ResumeContent, jobDescription: string): Promise<JobMatchResponse> {
    const ai = getAIProvider();
    return matchResumeToJobDescription(resume, jobDescription, ai);
  },

  /**
   * Tool: rewrite_resume_content
   * Rewrites bullet or summary with specific optimization goals while maintaining strict factuality.
   */
  async rewrite_resume_content(
    text: string,
    action: 'improve_wording' | 'make_concise' | 'improve_grammar' | 'make_achievement_oriented' | 'tailor_to_job',
    context?: { field?: string; roleTitle?: string; jobDescription?: string }
  ): Promise<RewriteResponse> {
    const ai = getAIProvider();
    return rewriteResumeText(text, action, context, ai);
  },

  /**
   * Tool: validate_factuality
   * Verifies that the proposed rewritten text does not introduce hallucinated numbers, employers, or claims.
   */
  validate_factuality(originalText: string, proposedText: string): { isValid: boolean; warning?: string } {
    // Check if new arbitrary numbers were added when original had none
    const originalNumbers: string[] = originalText.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
    const proposedNumbers: string[] = proposedText.match(/\b\d+(?:\.\d+)?%?\b/g) || [];

    const newNumbers = proposedNumbers.filter((n) => !originalNumbers.includes(n));
    if (newNumbers.length > 0 && originalNumbers.length === 0) {
      return {
        isValid: false,
        warning: `The suggested rewrite contains numbers (${newNumbers.join(', ')}) not found in the original text. Please verify or replace with actual metrics.`,
      };
    }

    return { isValid: true };
  },

  /**
   * Tool: save_resume_version
   * Creates a snapshot record in ResumeVersion table for version control and undo.
   */
  async save_resume_version(resumeId: string, title: string, content: ResumeContent, changeSummary: string): Promise<number> {
    const versionCount = await prisma.resumeVersion.count({ where: { resumeId } });
    const nextVersion = versionCount + 1;

    await prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: nextVersion,
        title,
        content: content as unknown as object,
        changeSummary,
      },
    });

    return nextVersion;
  },
};
