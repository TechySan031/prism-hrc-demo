// Resume data types — aligned with ResumeContentSchema (Zod source of truth)
// All templates, the builder, and AI operate on these types

import type { ResumeContent } from './resume-schema';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ExperienceEntry {
  id: string;
  title?: string;
  role?: string; // alias for title
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  school?: string;
  field?: string;
  institution?: string; // alias for school
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  role?: string;
  description?: string;
  url?: string;
  technologies: string[];
  bullets?: string[];
  highlights?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export type LanguageProficiency =
  | 'native'
  | 'fluent'
  | 'proficient'
  | 'intermediate'
  | 'basic'
  | 'Native'
  | 'Fluent'
  | 'Advanced'
  | 'Intermediate'
  | 'Basic'
  | string;

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: LanguageProficiency;
}

export type SectionType =
  | 'personal'
  | 'headline'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'custom';

export interface ResumeSection {
  id: string;
  type: SectionType;
  title?: string;
  visible: boolean;
  order: number;
}

/**
 * The canonical Resume type used throughout the frontend.
 * Compatible with database jsonb, Zod schemas, and legacy mock datasets.
 */
export interface Resume extends Omit<ResumeContent, 'sections' | 'headline' | 'experience' | 'education' | 'projects' | 'languages' | 'personal'> {
  id: string;
  title: string;
  templateId: string;
  atsScore?: number | null;
  createdAt: string;
  updatedAt: string;
  personal: PersonalInfo;
  headline: string | { title: string };
  sections: ResumeSection[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  languages: LanguageEntry[];
  customSections?: any[];
  completionPercentage?: number;
}

export interface TemplateSettings {
  templateId: string;
  fontSize: number | string;
  spacing: number | string;
  accentColor: string;
  fontFamily?: string;
  margins?: number;
}

export type TemplateId = 'ats-professional' | 'modern-split' | 'minimal-executive';

export interface ResumeTemplate {
  id: TemplateId;
  name: string;
  description: string;
  label: string;
  previewImage: string;
}
