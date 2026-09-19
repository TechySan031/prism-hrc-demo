import { ResumeContent, ResumeContentSchema } from '@/types/resume-schema';

export function parseRawTextToResume(rawText: string, defaultTitle?: string): ResumeContent {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Extract Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatches = rawText.match(emailRegex);
  const email = emailMatches ? emailMatches[0] : '';

  // 2. Extract Phone
  const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/gi;
  const phoneMatches = rawText.match(phoneRegex);
  const phone = phoneMatches ? phoneMatches[0].trim() : '';

  // 3. Extract Links (LinkedIn, GitHub, Website)
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
  const urlRegex = /https?:\/\/[^\s]+/i;

  const linkedinMatch = rawText.match(linkedinRegex);
  const githubMatch = rawText.match(githubRegex);
  const urlMatch = rawText.match(urlRegex);

  const linkedin = linkedinMatch ? linkedinMatch[0] : '';
  const github = githubMatch ? githubMatch[0] : '';
  const website = urlMatch && urlMatch[0] !== linkedin && urlMatch[0] !== github ? urlMatch[0] : '';

  // 4. Extract Candidate Name & Location
  let fullName = '';
  let location = '';

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.includes('@') || line.match(phoneRegex)) continue;
    if (line.toLowerCase().includes('resume') || line.toLowerCase().includes('curriculum')) continue;
    if (!fullName && line.length > 2 && line.length < 50 && !line.includes('•') && !line.includes('|')) {
      fullName = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      continue;
    }
    if (line.includes(',') && !location && line.length < 50) {
      location = line.trim();
    }
  }

  if (!fullName) {
    fullName = defaultTitle?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Candidate';
  }

  // 5. Segment into Sections
  const sectionKeywords: Record<string, string[]> = {
    summary: ['summary', 'professional summary', 'executive summary', 'profile', 'about me', 'objective'],
    experience: ['experience', 'work experience', 'employment history', 'professional experience', 'work history'],
    education: ['education', 'academic background', 'academic history', 'degrees'],
    skills: ['skills', 'technical skills', 'core competencies', 'technologies', 'expertise'],
    projects: ['projects', 'key projects', 'personal projects', 'portfolio'],
    certifications: ['certifications', 'certificates', 'licenses'],
    achievements: ['achievements', 'awards', 'honors'],
    languages: ['languages', 'language proficiencies'],
  };

  type SectionKey = keyof typeof sectionKeywords;
  const sectionBlocks: Record<SectionKey, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  };

  let currentSection: SectionKey | null = null;
  const otherLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase().replace(/[:\-_]/g, '').trim();

    let matchedSection: SectionKey | null = null;
    for (const [secKey, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some((kw) => lower === kw || lower === `${kw}:` || lower === `${kw} & expertise`)) {
        matchedSection = secKey as SectionKey;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else if (currentSection) {
      sectionBlocks[currentSection].push(line);
    } else {
      otherLines.push(line);
    }
  }

  // 6. Parse Summary
  const summary = sectionBlocks.summary.join(' ').trim();

  // 7. Parse Headline
  let headline = '';
  if (otherLines.length > 1) {
    for (const l of otherLines) {
      if (l !== fullName && !l.includes('@') && l.length > 5 && l.length < 60) {
        headline = l;
        break;
      }
    }
  }

  // 8. Parse Experience
  const experience: ResumeContent['experience'] = [];
  let currentExp: { title: string; company: string; startDate: string; endDate?: string; current: boolean; bullets: string[] } | null = null;

  for (const line of sectionBlocks.experience) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    const cleanText = line.replace(/^[•\-*]\s*/, '').trim();

    // Check if line looks like a title / company header (e.g. "Software Engineer | Google | 2021 - Present")
    const dateMatch = line.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\.?\s*)?\d{4}\s*(?:-|–|to)\s*(?:Present|Current|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\.?\s*)?\d{4})/i);

    if (!isBullet && (dateMatch || line.includes('|') || (line.length < 80 && line === line.toUpperCase()))) {
      if (currentExp) {
        experience.push({
          id: `exp-${experience.length + 1}`,
          title: currentExp.title || 'Role',
          company: currentExp.company || 'Company',
          startDate: currentExp.startDate || '2020',
          endDate: currentExp.endDate,
          current: currentExp.current,
          bullets: currentExp.bullets.length > 0 ? currentExp.bullets : ['Contributed to key operational and technical milestones.'],
        });
      }

      const parts = line.split(/[|•–-]/).map((p) => p.trim());
      const title = parts[0] || 'Role';
      const company = parts[1] || 'Company';
      const dates = dateMatch ? dateMatch[0] : '2021 - Present';
      const isCurrent = /present|current/i.test(dates);

      currentExp = {
        title,
        company,
        startDate: dates.split(/[-–to]/)[0]?.trim() || '2021',
        endDate: isCurrent ? undefined : dates.split(/[-–to]/)[1]?.trim() || '2023',
        current: isCurrent,
        bullets: [],
      };
    } else if (currentExp) {
      if (cleanText) {
        currentExp.bullets.push(cleanText);
      }
    }
  }

  if (currentExp) {
    experience.push({
      id: `exp-${experience.length + 1}`,
      title: currentExp.title || 'Role',
      company: currentExp.company || 'Company',
      startDate: currentExp.startDate || '2020',
      endDate: currentExp.endDate,
      current: currentExp.current,
      bullets: currentExp.bullets.length > 0 ? currentExp.bullets : ['Managed and executed critical deliverables.'],
    });
  }

  // 9. Parse Education
  const education: ResumeContent['education'] = [];
  for (const line of sectionBlocks.education) {
    if (line.length < 5) continue;
    education.push({
      id: `edu-${education.length + 1}`,
      degree: line.split(/[,|–-]/)[0]?.trim() || line,
      school: line.split(/[,|–-]/)[1]?.trim() || 'University',
      startDate: '2016',
      endDate: '2020',
      highlights: [],
    });
  }

  // 10. Parse Skills
  const skills: ResumeContent['skills'] = [];
  const rawSkills = sectionBlocks.skills.join(' ');
  const skillTokens = rawSkills
    .split(/[,|•;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 35 && !s.includes(':'));

  if (skillTokens.length > 0) {
    skills.push({
      id: 'skill-cat-1',
      category: 'Core Competencies',
      skills: skillTokens.slice(0, 25),
    });
  }

  const structured: ResumeContent = {
    personal: {
      fullName,
      email,
      phone,
      location,
      website,
      linkedin,
      github,
    },
    headline: headline || 'Experienced Professional',
    summary: summary || 'Results-driven professional with a proven track record of delivering measurable business outcomes and operational excellence.',
    experience,
    education,
    skills,
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    sections: [
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
    ],
  };

  return ResumeContentSchema.parse(structured);
}
