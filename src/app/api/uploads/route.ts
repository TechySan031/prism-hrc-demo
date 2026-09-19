import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getStorageProvider } from '@/lib/storage';
import { extractTextFromFile, normalizeExtractedText, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/parser/extractor';
import { parseRawTextToResume } from '@/lib/parser/resume-parser';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtAllowed = ['pdf', 'docx', 'doc', 'txt'].includes(ext || '');

    if (!isMimeAllowed && !isExtAllowed) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Store file securely
    const storage = getStorageProvider();
    const { storageKey } = await storage.saveFile(buffer, file.name, file.type);

    // 2. Extract and normalize raw text
    let rawText = '';
    try {
      rawText = await extractTextFromFile(buffer, file.type, file.name);
    } catch (extractError: unknown) {
      const msg = extractError instanceof Error ? extractError.message : 'Text extraction failed';
      return NextResponse.json({ error: `Could not extract text from document: ${msg}` }, { status: 422 });
    }

    const normalizedText = normalizeExtractedText(rawText);
    if (!normalizedText || normalizedText.length < 20) {
      return NextResponse.json(
        { error: 'The document appears to be empty or unreadable (e.g. scanned image without OCR).' },
        { status: 422 }
      );
    }

    // 3. Parse into structured Resume Content
    const structuredContent = parseRawTextToResume(normalizedText, file.name);
    const resumeTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'My Resume';

    // 4. Save to PostgreSQL
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: resumeTitle,
        content: structuredContent as unknown as object,
        templateId: 'ats-professional',
        templateSettings: {
          templateId: 'ats-professional',
          fontSize: 'regular',
          spacing: 'normal',
          accentColor: '#3B7A8C',
        },
      },
    });

    // 5. Save UploadedFile record
    await prisma.uploadedFile.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        storageKey,
        storageProvider: process.env.STORAGE_PROVIDER || 'local',
        extractedText: normalizedText,
      },
    });

    // 6. Record usage
    await prisma.usageRecord.create({
      data: {
        userId: user.id,
        actionType: 'UPLOAD',
      },
    });

    return NextResponse.json(
      {
        success: true,
        resumeId: resume.id,
        title: resume.title,
        message: 'Resume uploaded and parsed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred while uploading and parsing your resume. Please try again.' },
      { status: 500 }
    );
  }
}
