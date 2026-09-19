import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getAIProvider, AIConfigurationError } from '@/lib/ai/provider';
import { runResumeAnalysis } from '@/lib/ai/scoring-engine';
import { ResumeContent } from '@/types/resume-schema';

export async function POST(req: NextRequest) {
  try {
    let user = await getSessionUser();
    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: 'CANDIDATE' },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    let aiProvider;
    try {
      aiProvider = getAIProvider();
    } catch (aiErr) {
      if (aiErr instanceof AIConfigurationError) {
        return NextResponse.json(
          {
            error: 'AI provider is not configured. Please set AI_API_KEY in environment variables (.env).',
            code: 'AI_NOT_CONFIGURED',
          },
          { status: 503 }
        );
      }
      throw aiErr;
    }

    const analysis = await runResumeAnalysis(resume.content as unknown as ResumeContent, aiProvider);

    // Save ResumeAnalysis record to PostgreSQL
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: user.id,
        overallScore: analysis.overallScore,
        scores: analysis.scores as object,
        strengths: analysis.strengths as object,
        recommendations: analysis.recommendations as object,
        missingInfo: analysis.missingInfo as object,
      },
    });

    // Update resume atsScore
    await prisma.resume.update({
      where: { id: resume.id },
      data: { atsScore: analysis.overallScore },
    });

    // Record usage
    await prisma.usageRecord.create({
      data: {
        userId: user.id,
        actionType: 'ANALYSIS',
      },
    });

    return NextResponse.json({ success: true, analysis: savedAnalysis }, { status: 201 });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to run analysis. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        resumeId: true,
        overallScore: true,
        createdAt: true,
        resume: {
          select: { title: true },
        },
      },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Fetch analyses error:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}
