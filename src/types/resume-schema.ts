import { z } from 'zod';

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  role: z.string().optional(),
  company: z.string().default(''),
  location: z.string().optional(),
  startDate: z.string().default(''),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EducationEntrySchema = z.object({
  id: z.string(),
  degree: z.string().default(''),
  school: z.string().default(''),
  field: z.string().optional(),
  institution: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const SkillCategorySchema = z.object({
  id: z.string(),
  category: z.string().default(''),
  skills: z.array(z.string()).default([]),
});

export const ProjectEntrySchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  role: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  highlights: z.array(z.string()).optional(),
});

export const CertificationEntrySchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const AchievementEntrySchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  description: z.string().default(''),
  date: z.string().optional(),
});

export const LanguageEntrySchema = z.object({
  id: z.string(),
  language: z.string(),
  proficiency: z.string().default('proficient'),
});

export const SectionConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional().default(''),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const PersonalInfoSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  website: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
});

export const ResumeContentSchema = z.object({
  personal: PersonalInfoSchema.default({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  }),
  headline: z.union([z.string(), z.object({ title: z.string() })]).transform((val) => typeof val === 'string' ? val : val.title).default(''),
  summary: z.string().default(''),
  experience: z.array(ExperienceEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  skills: z.array(SkillCategorySchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
  achievements: z.array(AchievementEntrySchema).default([]),
  languages: z.array(LanguageEntrySchema).default([]),
  sections: z.array(SectionConfigSchema).default([
    { id: 'sec-personal', type: 'personal', title: 'Personal Info', visible: true, order: 0 },
    { id: 'sec-headline', type: 'headline', title: 'Headline', visible: true, order: 1 },
    { id: 'sec-summary', type: 'summary', title: 'Summary', visible: true, order: 2 },
    { id: 'sec-experience', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
    { id: 'sec-education', type: 'education', title: 'Education', visible: true, order: 4 },
    { id: 'sec-skills', type: 'skills', title: 'Skills', visible: true, order: 5 },
    { id: 'sec-projects', type: 'projects', title: 'Projects', visible: true, order: 6 },
    { id: 'sec-certifications', type: 'certifications', title: 'Certifications', visible: true, order: 7 },
    { id: 'sec-achievements', type: 'achievements', title: 'Achievements', visible: true, order: 8 },
    { id: 'sec-languages', type: 'languages', title: 'Languages', visible: true, order: 9 },
  ]),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;
