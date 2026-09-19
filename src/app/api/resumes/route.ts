import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ResumeContentSchema } from '@/types/resume-schema';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        templateId: true,
        atsScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Fetch resumes error:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'Untitled Resume';

    const defaultContent = {
      personal: {
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
      },
      headline: 'Professional Role',
      summary: '',
      experience: [],
      education: [],
      skills: [],
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

    const validatedContent = ResumeContentSchema.parse(body.content || defaultContent);

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title,
        content: validatedContent as unknown as object,
        templateId: body.templateId || 'ats-professional',
        templateSettings: body.templateSettings || {
          templateId: 'ats-professional',
          fontSize: 'regular',
          spacing: 'normal',
          accentColor: '#3B7A8C',
        },
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error('Create resume error:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
