import { ResumeContent } from '@/types/resume-schema';

/**
 * Clean, standard-compliant PDF 1.4 binary generator.
 * Produces real vector PDF documents with margins, fonts, headers, and text wrapping.
 */
export function generateResumePdfBuffer(resume: ResumeContent, title?: string): Buffer {
  const objects: string[] = [];
  const byteOffsets: number[] = [];

  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length; // 1-based object index
  };

  // 1. Catalog
  addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

  // 2. Pages object (will populate kids later)
  // Page object will be 3, Font will be 4
  addObject(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

  // 4. Font object (Helvetica standard Type1)
  const fontObjId = 4;

  // Build the page stream content
  const streamCommands: string[] = [];

  const marginX = 50;
  const pageWidth = 595; // A4 standard pt
  const pageHeight = 842;
  let currentY = pageHeight - 50;

  const escapePdfText = (str: string): string => {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  };

  const addText = (text: string, x: number, y: number, size: number, isBold = false) => {
    const fontName = isBold ? '/F2' : '/F1';
    streamCommands.push(`BT ${fontName} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
  };

  const addCenteredText = (text: string, y: number, size: number, isBold = false) => {
    const approxCharWidth = size * 0.52;
    const textWidth = text.length * approxCharWidth;
    const x = Math.max(marginX, (pageWidth - textWidth) / 2);
    addText(text, x, y, size, isBold);
  };

  const addHorizontalRule = (y: number) => {
    streamCommands.push(`0.8 0.8 0.8 RG 1 w ${marginX} ${y} m ${pageWidth - marginX} ${y} l S 0 0 0 RG`);
  };

  const personal = resume.personal || {};

  // Header: Full Name
  const candidateName = personal.fullName || title || 'Resume';
  addCenteredText(candidateName.toUpperCase(), currentY, 20, true);
  currentY -= 24;

  // Headline
  if (resume.headline) {
    addCenteredText(resume.headline, currentY, 11, false);
    currentY -= 16;
  }

  // Contact line
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);
  if (contacts.length > 0) {
    addCenteredText(contacts.join('  |  '), currentY, 9, false);
    currentY -= 20;
  }

  addHorizontalRule(currentY);
  currentY -= 20;

  // Wrap text helper
  const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Section: Summary
  if (resume.summary && currentY > 100) {
    addText('PROFESSIONAL SUMMARY', marginX, currentY, 11, true);
    currentY -= 14;

    const summaryLines = wrapText(resume.summary, 90);
    for (const line of summaryLines) {
      if (currentY < 60) break;
      addText(line, marginX, currentY, 9.5, false);
      currentY -= 13;
    }
    currentY -= 10;
  }

  // Section: Experience
  if (resume.experience && resume.experience.length > 0 && currentY > 100) {
    addText('WORK EXPERIENCE', marginX, currentY, 11, true);
    currentY -= 15;

    for (const exp of resume.experience) {
      if (currentY < 70) break;

      const dateStr = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}`;
      addText(exp.title, marginX, currentY, 10, true);
      addText(` | ${exp.company}`, marginX + exp.title.length * 6 + 10, currentY, 10, false);
      addText(dateStr, pageWidth - marginX - dateStr.length * 5.5, currentY, 9, false);
      currentY -= 14;

      for (const bullet of exp.bullets || []) {
        if (currentY < 50) break;
        const wrapped = wrapText(bullet, 86);
        for (let i = 0; i < wrapped.length; i++) {
          if (currentY < 50) break;
          const prefix = i === 0 ? '• ' : '  ';
          addText(prefix + wrapped[i], marginX + 8, currentY, 9, false);
          currentY -= 12;
        }
      }
      currentY -= 6;
    }
  }

  // Section: Education
  if (resume.education && resume.education.length > 0 && currentY > 80) {
    addText('EDUCATION', marginX, currentY, 11, true);
    currentY -= 15;

    for (const edu of resume.education) {
      if (currentY < 50) break;
      addText(`${edu.degree} - ${edu.school}`, marginX, currentY, 9.5, true);
      if (edu.endDate) {
        addText(edu.endDate, pageWidth - marginX - edu.endDate.length * 6, currentY, 9, false);
      }
      currentY -= 14;
    }
    currentY -= 8;
  }

  // Section: Skills
  if (resume.skills && resume.skills.length > 0 && currentY > 60) {
    addText('SKILLS & COMPETENCIES', marginX, currentY, 11, true);
    currentY -= 14;

    for (const cat of resume.skills) {
      if (currentY < 40) break;
      const skillsStr = (cat.skills || []).join(', ');
      addText(`${cat.category}: `, marginX, currentY, 9, true);
      const prefixWidth = (cat.category.length + 2) * 5.2;
      addText(skillsStr, marginX + prefixWidth, currentY, 9, false);
      currentY -= 13;
    }
  }

  const streamContent = streamCommands.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  // 3. Page Object
  // 4. Font 1 (Helvetica)
  // 5. Font 2 (Helvetica-Bold)
  // 6. Content stream
  const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`;
  const font1Obj = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  const font2Obj = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
  const contentStreamObj = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`;

  // Object 3
  objects.push(pageObj);
  // Object 4
  objects.push(font1Obj);
  // Object 5
  objects.push(font2Obj);
  // Object 6
  objects.push(contentStreamObj);

  // Assemble PDF binary
  let pdf = '%PDF-1.4\n';

  for (let i = 0; i < objects.length; i++) {
    byteOffsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;

  for (const offset of byteOffsets) {
    const formatted = String(offset).padStart(10, '0');
    pdf += `${formatted} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}
