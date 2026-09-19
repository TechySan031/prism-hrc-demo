import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { ResumeContent } from '@/types/resume-schema';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
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

    const content = resume.content as unknown as ResumeContent;
    const personal = content.personal || {};

    const children: Paragraph[] = [];

    // 1. Header Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE,
        children: [
          new TextRun({
            text: personal.fullName || resume.title,
            bold: true,
            size: 32,
            font: 'Arial',
            color: '1E3742',
          }),
        ],
      })
    );

    // 2. Headline
    if (content.headline) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: content.headline,
              italics: true,
              size: 22,
              font: 'Arial',
              color: '3B7A8C',
            }),
          ],
        })
      );
    }

    // 3. Contact Info Line
    const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: contactParts.join('  •  '),
              size: 18,
              font: 'Arial',
              color: '5C554E',
            }),
          ],
        })
      );
    }

    // 4. Professional Summary
    if (content.summary) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'PROFESSIONAL SUMMARY',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '244E5C',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: content.summary,
              size: 20,
              font: 'Arial',
            }),
          ],
        })
      );
    }

    // 5. Work Experience
    if (content.experience && content.experience.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'WORK EXPERIENCE',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '244E5C',
            }),
          ],
        })
      );

      for (const exp of content.experience) {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: exp.title,
                bold: true,
                size: 20,
                font: 'Arial',
              }),
              new TextRun({
                text: ` | ${exp.company}`,
                size: 20,
                font: 'Arial',
                color: '3B7A8C',
              }),
              new TextRun({
                text: `   (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''})`,
                italics: true,
                size: 18,
                font: 'Arial',
                color: '7A7168',
              }),
            ],
          })
        );

        for (const bullet of exp.bullets || []) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 19,
                  font: 'Arial',
                }),
              ],
            })
          );
        }
      }
    }

    // 6. Education
    if (content.education && content.education.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: 'EDUCATION',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '244E5C',
            }),
          ],
        })
      );

      for (const edu of content.education) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 20,
                font: 'Arial',
              }),
              new TextRun({
                text: ` - ${edu.school}`,
                size: 20,
                font: 'Arial',
              }),
              new TextRun({
                text: edu.endDate ? ` (${edu.endDate})` : '',
                italics: true,
                size: 18,
                font: 'Arial',
                color: '7A7168',
              }),
            ],
          })
        );
      }
    }

    // 7. Skills
    if (content.skills && content.skills.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: 'SKILLS & COMPETENCIES',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '244E5C',
            }),
          ],
        })
      );

      for (const cat of content.skills) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `${cat.category}: `,
                bold: true,
                size: 19,
                font: 'Arial',
              }),
              new TextRun({
                text: (cat.skills || []).join(', '),
                size: 19,
                font: 'Arial',
              }),
            ],
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const sanitizedFilename = (resume.title || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}.docx"`,
      },
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX export' }, { status: 500 });
  }
}
