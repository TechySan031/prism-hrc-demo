// Mock service interfaces — clean abstractions for future API replacement
// Each function returns mock data with simulated delays

import { Resume } from '@/types/resume';
import { AnalysisReport, AIRewriteSuggestion, JobMatchResult } from '@/types/analysis';
import { mockResumes, blankResume, createNewResume } from './resumes';
import { mockAnalysisReport, mockAISuggestions } from './analysis';
import { mockJobMatchResult } from './job-match';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let localResumes = [...mockResumes];

// ── Resume Service ──────────────────────────────────────────────
export const resumeService = {
  async getAll(): Promise<Resume[]> {
    await delay(400);
    return [...localResumes];
  },

  async getById(id: string): Promise<Resume | null> {
    await delay(200);
    return localResumes.find((r) => r.id === id) ?? null;
  },

  async create(fromTemplate?: string): Promise<Resume> {
    await delay(300);
    const id = `resume-${Date.now()}`;
    const resume = fromTemplate
      ? { ...localResumes.find((r) => r.id === fromTemplate) ?? createNewResume(id), id, title: 'New Resume' }
      : createNewResume(id);
    localResumes = [resume, ...localResumes];
    return resume;
  },

  async update(resume: Resume): Promise<Resume> {
    await delay(200);
    const updated = { ...resume, updatedAt: new Date().toISOString() };
    localResumes = localResumes.map((r) => (r.id === resume.id ? updated : r));
    return updated;
  },

  async duplicate(id: string): Promise<Resume | null> {
    await delay(300);
    const source = localResumes.find((r) => r.id === id);
    if (!source) return null;
    const newResume = { ...source, id: `resume-${Date.now()}`, title: `${source.title} (Copy)`, createdAt: new Date().toISOString() };
    localResumes = [newResume, ...localResumes];
    return newResume;
  },

  async remove(id: string): Promise<boolean> {
    await delay(200);
    const len = localResumes.length;
    localResumes = localResumes.filter((r) => r.id !== id);
    return localResumes.length < len;
  },

  async loadBlank(): Promise<Resume> {
    await delay(200);
    const id = `resume-${Date.now()}`;
    const resume = { ...blankResume, id };
    localResumes = [resume, ...localResumes];
    return resume;
  },

  resetData(): void {
    localResumes = [...mockResumes];
  },
};

// ── Analysis Service ────────────────────────────────────────────
export const analysisService = {
  async analyzeResume(_resumeId: string): Promise<AnalysisReport> {
    // Simulate multi-step processing
    await delay(2000);
    return { ...mockAnalysisReport, id: `analysis-${Date.now()}`, resumeId: _resumeId };
  },

  async getReport(id: string): Promise<AnalysisReport | null> {
    await delay(300);
    if (id) return mockAnalysisReport;
    return null;
  },
};

// ── AI Service ──────────────────────────────────────────────────
export const aiService = {
  async rewrite(text: string, action: string): Promise<AIRewriteSuggestion> {
    await delay(1500);
    // Find a matching mock suggestion or generate a generic one
    const match = mockAISuggestions.find((s) => s.action === action);
    if (match && text) {
      return { ...match, id: `ai-${Date.now()}`, original: text, status: 'pending' };
    }
    return {
      id: `ai-${Date.now()}`,
      field: 'text',
      original: text,
      suggested: `${text} [Enhanced with improved wording and clarity]`,
      explanation: 'This is a simulated AI suggestion. In production, this would use a language model to provide contextual improvements.',
      action: action as AIRewriteSuggestion['action'],
      status: 'pending',
    };
  },

  async generateQuestions(_text: string): Promise<string[]> {
    await delay(1000);
    return [
      'What was the measurable outcome of this work?',
      'How many users or stakeholders were affected?',
      'What technologies did you use directly?',
    ];
  },
};

// ── Job Match Service ───────────────────────────────────────────
export const jobMatchService = {
  async matchResume(_resumeId: string, _jobDescription: string): Promise<JobMatchResult> {
    await delay(2000);
    return mockJobMatchResult;
  },
};

// ── Auth Service ────────────────────────────────────────────────
export const authService = {
  async loginDemo(): Promise<boolean> {
    await delay(500);
    return true;
  },

  async logout(): Promise<void> {
    await delay(200);
  },
};
