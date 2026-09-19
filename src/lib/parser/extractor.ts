import path from 'path';
import { pathToFileURL } from 'url';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// Ensure pdfjs worker is explicitly configured with file:// URL in Next.js
try {
  const workerPath = path.resolve(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  PDFParse.setWorker(pathToFileURL(workerPath).href);
} catch {
  // worker initialization fallback
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (mimeType === 'text/plain' || ext === 'txt') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}. Please upload a PDF, DOCX, or TXT file.`);
}

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '•')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
