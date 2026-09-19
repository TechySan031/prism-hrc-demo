import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getAIProvider, AIConfigurationError } from '@/lib/ai/provider';
import { rewriteResumeText } from '@/lib/ai/rewriter';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text, action = 'improve_wording', roleTitle, field = 'experience_bullet', jobDescription } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    let aiProvider;
    try {
      aiProvider = getAIProvider();
    } catch (aiErr) {
      if (aiErr instanceof AIConfigurationError) {
        return NextResponse.json(
          { error: 'AI provider is not configured. Please configure AI_API_KEY in .env', code: 'AI_NOT_CONFIGURED' },
          { status: 503 }
        );
      }
      throw aiErr;
    }

    const result = await rewriteResumeText(
      text,
      action,
      { field, roleTitle, jobDescription },
      aiProvider
    );

    await prisma.usageRecord.create({
      data: {
        userId: user.id,
        actionType: 'AI_REWRITE',
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Bullet improve error:', error);
    return NextResponse.json({ error: 'Failed to improve bullet point' }, { status: 500 });
  }
}
