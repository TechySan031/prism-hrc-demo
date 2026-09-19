import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ResumeContentSchema } from '@/types/resume-schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this resume' }, { status: 403 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Fetch resume error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (existingResume.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this resume' }, { status: 403 });
    }

    let parsedContent = existingResume.content;
    if (body.content) {
      const validation = ResumeContentSchema.safeParse(body.content);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid resume content schema', details: validation.error.issues },
          { status: 400 }
        );
      }
      parsedContent = validation.data as unknown as object;
    }

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existingResume.title,
        content: parsedContent as Prisma.InputJsonValue,
        templateId: body.templateId !== undefined ? body.templateId : existingResume.templateId,
        templateSettings: (body.templateSettings !== undefined ? body.templateSettings : existingResume.templateSettings) as Prisma.InputJsonValue,
        atsScore: body.atsScore !== undefined ? body.atsScore : existingResume.atsScore,
      },
    });

    // Optional snapshot versioning
    if (body.createVersion) {
      const versionCount = await prisma.resumeVersion.count({ where: { resumeId: id } });
      await prisma.resumeVersion.create({
        data: {
          resumeId: id,
          versionNumber: versionCount + 1,
          title: updatedResume.title,
          content: updatedResume.content as object,
          changeSummary: body.changeSummary || `Version ${versionCount + 1}`,
        },
      });
    }

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (existingResume.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
