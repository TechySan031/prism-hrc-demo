import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getAIProvider, AIConfigurationError } from '@/lib/ai/provider';
import { matchResumeToJobDescription } from '@/lib/ai/job-matcher';
import { ResumeContent } from '@/types/resume-schema';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription } = body;

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: 'resumeId and jobDescription are required' }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let aiProvider;
    try {
      aiProvider = getAIProvider();
    } catch (aiErr) {
      if (aiErr instanceof AIConfigurationError) {
        return NextResponse.json(
          { error: 'AI provider is not configured. Please set AI_API_KEY in environment variables (.env).', code: 'AI_NOT_CONFIGURED' },
          { status: 503 }
        );
      }
      throw aiErr;
    }

    const matchResult = await matchResumeToJobDescription(
      resume.content as unknown as ResumeContent,
      jobDescription,
      aiProvider
    );

    await prisma.usageRecord.create({
      data: {
        userId: user.id,
        actionType: 'JOB_MATCH',
      },
    });

    return NextResponse.json({ success: true, matchResult });
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json({ error: 'Failed to run job matching' }, { status: 500 });
  }
}
