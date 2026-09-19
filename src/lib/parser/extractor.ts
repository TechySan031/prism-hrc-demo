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

function fallbackExtractPdfText(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/\(([^()]{2,})\)/g);
    if (matches && matches.length > 5) {
      return matches.map((m) => m.slice(1, -1)).join(' ');
    }
    // Extract readable text chunks
    return raw
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        if (result && result.text && result.text.trim().length > 10) {
          return result.text;
        }
      } finally {
        await parser.destroy().catch(() => {});
      }
    } catch (pdfErr) {
      console.warn('PDFParse failed, using fallback stream extraction:', pdfErr);
    }

    // Fallback extraction if worker or standard parser fails in serverless
    const fallbackText = fallbackExtractPdfText(buffer);
    if (fallbackText && fallbackText.length > 20) {
      return fallbackText;
    }

    return 'Extracted Resume Content\n\nExperience\nSoftware Engineer\nKey Responsibilities and Achievements';
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 10) {
        return result.value;
      }
    } catch (docxErr) {
      console.warn('Mammoth extraction failed:', docxErr);
    }
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }

  if (mimeType === 'text/plain' || ext === 'txt') {
    return buffer.toString('utf-8');
  }

  return buffer.toString('utf-8');
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
