import { ResumeTemplate, TemplateSettings } from '@/types/resume';

export const mockTemplates: ResumeTemplate[] = [
  {
    id: 'ats-professional',
    name: 'ATS Professional',
    description: 'Clean, single-column layout optimized for applicant tracking systems. Maximum compatibility with automated resume parsers.',
    label: 'ATS-Friendly',
    previewImage: '/templates/ats-professional.png',
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    description: 'Contemporary two-column design with a sidebar for skills and contact info. Balances visual appeal with readability.',
    label: 'Modern',
    previewImage: '/templates/modern-split.png',
  },
  {
    id: 'minimal-executive',
    name: 'Minimal Executive',
    description: 'Refined, spacious layout with elegant typography. Designed for senior professionals and executive roles.',
    label: 'Executive',
    previewImage: '/templates/minimal-executive.png',
  },
];

export const defaultTemplateSettings: TemplateSettings = {
  templateId: 'ats-professional',
  fontSize: 10,
  spacing: 1,
  accentColor: '#3B7A8C',
  fontFamily: 'Inter',
};
