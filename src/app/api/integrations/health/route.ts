import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Quick DB connectivity check
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      service: 'Prism HRC AI Resume Agent',
      version: '1.0.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
      agentCapabilities: [
        'parse_resume',
        'extract_resume_structure',
        'analyze_resume',
        'detect_missing_information',
        'analyze_job_description',
        'match_resume_to_job',
        'generate_improvement_suggestions',
        'rewrite_resume_content',
        'validate_factuality',
        'save_resume_version',
        'generate_pdf',
        'generate_docx',
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', error: String(error) },
      { status: 503 }
    );
  }
}
