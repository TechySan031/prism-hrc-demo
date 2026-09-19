import { prisma } from '@/lib/prisma';
import { AgentTools } from './tools';
import { ResumeContent } from '@/types/resume-schema';
import { getStorageProvider } from '@/lib/storage';

export class AgentOrchestrator {
  /**
   * Helper to initialize and log an AgentRun for observability and auditing.
   */
  private static async startRun(userId: string, operation: string, resumeId?: string, jobDescriptionId?: string) {
    return prisma.agentRun.create({
      data: {
        userId,
        resumeId,
        jobDescriptionId,
        operation,
        status: 'RUNNING',
        agentState: 'INITIALIZED',
        toolsExecuted: [],
        metadata: {
          timestamp: new Date().toISOString(),
          model: process.env.AI_MODEL || 'gpt-4o',
          provider: process.env.AI_PROVIDER || 'openai',
        },
      },
    });
  }

  /**
   * Helper to complete an AgentRun with executed tools and status.
   */
  private static async completeRun(runId: string, toolsExecuted: string[], metadata?: Record<string, unknown>) {
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        agentState: 'COMPLETED',
        toolsExecuted,
        metadata: metadata as object,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Helper to fail an AgentRun cleanly without leaking sensitive stack traces.
   */
  private static async failRun(runId: string, error: string, toolsExecuted: string[]) {
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        agentState: 'ERROR',
        toolsExecuted,
        error,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Orchestrates full Resume Ingestion:
   * 1. Tool: parse_resume (extracts raw text)
   * 2. Tool: extract_resume_structure (converts to structured ResumeContent)
   * 3. Stores original document securely
   * 4. Persists to PostgreSQL
   * 5. Saves initial Version 1 snapshot
   */
  static async ingestResume(userId: string, buffer: Buffer, mimeType: string, filename: string) {
    const run = await this.startRun(userId, 'EXTRACT_RESUME');
    const toolsUsed: string[] = [];

    try {
      // 1. Parse & Normalize
      toolsUsed.push('parse_resume');
      const normalizedText = await AgentTools.parse_resume(buffer, mimeType, filename);

      if (!normalizedText || normalizedText.length < 20) {
        throw new Error('Document appears to be empty or unreadable.');
      }

      // 2. Extract Structure
      toolsUsed.push('extract_resume_structure');
      const structuredContent = await AgentTools.extract_resume_structure(normalizedText, filename);

      // 3. Store file binary
      const storage = getStorageProvider();
      const { storageKey } = await storage.saveFile(buffer, filename, mimeType);

      // 4. Save to Database
      const resumeTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'My Resume';
      const resume = await prisma.resume.create({
        data: {
          userId,
          title: resumeTitle,
          content: structuredContent as unknown as object,
          templateId: 'ats-professional',
          templateSettings: {
            templateId: 'ats-professional',
            fontSize: 'regular',
            spacing: 'normal',
            accentColor: '#3B7A8C',
          },
        },
      });

      // 5. Store UploadedFile record
      await prisma.uploadedFile.create({
        data: {
          userId,
          resumeId: resume.id,
          originalFilename: filename,
          mimeType,
          sizeBytes: buffer.length,
          storageKey,
          extractedText: normalizedText,
        },
      });

      // 6. Save Version 1 snapshot
      toolsUsed.push('save_resume_version');
      await AgentTools.save_resume_version(resume.id, resume.title, structuredContent, 'Version 1: Initial upload');

      await this.completeRun(run.id, toolsUsed, { resumeId: resume.id, filename });

      return { success: true, resumeId: resume.id, title: resume.title };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest resume';
      await this.failRun(run.id, msg, toolsUsed);
      throw err;
    }
  }

  /**
   * Orchestrates Comprehensive Resume Analysis:
   * 1. Tool: analyze_resume (hybrid deterministic + AI evaluation)
   * 2. Tool: detect_missing_information (generates targeted questions)
   * 3. Persists ResumeAnalysis record
   * 4. Updates resume atsScore
   */
  static async analyzeResume(userId: string, resumeId: string) {
    const run = await this.startRun(userId, 'ANALYZE_RESUME', resumeId);
    const toolsUsed: string[] = [];

    try {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });

      if (!resume || resume.userId !== userId) {
        throw new Error('Resume not found or unauthorized');
      }

      toolsUsed.push('analyze_resume');
      const analysis = await AgentTools.analyze_resume(resume.content as unknown as ResumeContent);

      toolsUsed.push('detect_missing_information');
      const savedAnalysis = await prisma.resumeAnalysis.create({
        data: {
          resumeId: resume.id,
          userId,
          overallScore: analysis.overallScore,
          scores: analysis.scores as object,
          strengths: analysis.strengths as object,
          recommendations: analysis.recommendations as object,
          missingInfo: analysis.missingInfo as object,
        },
      });

      await prisma.resume.update({
        where: { id: resume.id },
        data: { atsScore: analysis.overallScore },
      });

      await prisma.usageRecord.create({
        data: { userId, actionType: 'ANALYSIS' },
      });

      await this.completeRun(run.id, toolsUsed, { analysisId: savedAnalysis.id, score: analysis.overallScore });

      return savedAnalysis;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      await this.failRun(run.id, msg, toolsUsed);
      throw err;
    }
  }

  /**
   * Orchestrates Job Description Matching:
   * 1. Stores JobDescription record
   * 2. Tool: match_resume_to_job
   * 3. Categorizes skills (Verified, Unverified, Missing)
   */
  static async matchJob(userId: string, resumeId: string, jobDescriptionText: string) {
    const run = await this.startRun(userId, 'MATCH_JOB', resumeId);
    const toolsUsed: string[] = [];

    try {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });

      if (!resume || resume.userId !== userId) {
        throw new Error('Resume not found or unauthorized');
      }

      const jd = await prisma.jobDescription.create({
        data: {
          userId,
          rawText: jobDescriptionText,
        },
      });

      toolsUsed.push('match_resume_to_job');
      const result = await AgentTools.match_resume_to_job(
        resume.content as unknown as ResumeContent,
        jobDescriptionText
      );

      await prisma.usageRecord.create({
        data: { userId, actionType: 'JOB_MATCH' },
      });

      await this.completeRun(run.id, toolsUsed, { jobDescriptionId: jd.id, matchScore: result.matchScore });

      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Job match failed';
      await this.failRun(run.id, msg, toolsUsed);
      throw err;
    }
  }

  /**
   * Orchestrates AI Content Rewriting:
   * 1. Tool: rewrite_resume_content
   * 2. Tool: validate_factuality (ensures no hallucinated numbers or claims)
   * 3. Returns suggestion requiring explicit candidate confirmation
   */
  static async suggestRewrite(
    userId: string,
    resumeId: string,
    originalText: string,
    action: 'improve_wording' | 'make_concise' | 'improve_grammar' | 'make_achievement_oriented' | 'tailor_to_job',
    context?: { field?: string; roleTitle?: string; jobDescription?: string }
  ) {
    const run = await this.startRun(userId, 'REWRITE_CONTENT', resumeId);
    const toolsUsed: string[] = [];

    try {
      toolsUsed.push('rewrite_resume_content');
      const rewrite = await AgentTools.rewrite_resume_content(originalText, action, context);

      toolsUsed.push('validate_factuality');
      const factCheck = AgentTools.validate_factuality(originalText, rewrite.suggested);

      await prisma.usageRecord.create({
        data: { userId, actionType: 'AI_REWRITE' },
      });

      await this.completeRun(run.id, toolsUsed, { action, factCheck });

      return {
        ...rewrite,
        factCheckWarning: factCheck.warning,
        requiresConfirmation: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rewrite failed';
      await this.failRun(run.id, msg, toolsUsed);
      throw err;
    }
  }

  /**
   * Orchestrates Applying an Approved Suggestion:
   * 1. Updates resume content in database
   * 2. Tool: save_resume_version (increments version snapshot)
   */
  static async applyApprovedContent(
    userId: string,
    resumeId: string,
    newContent: ResumeContent,
    changeSummary: string
  ) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
      throw new Error('Resume not found or unauthorized');
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        content: newContent as unknown as object,
        updatedAt: new Date(),
      },
    });

    const newVersionNumber = await AgentTools.save_resume_version(
      resumeId,
      updated.title,
      newContent,
      changeSummary
    );

    return { success: true, versionNumber: newVersionNumber, resume: updated };
  }
}
