import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tables: any = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    let userCount = -1;
    let userError = null;
    try {
      userCount = await prisma.user.count();
    } catch (e: any) {
      userError = e?.message || String(e);
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tableCount: tables.length,
      tables: tables.map((t: any) => t.table_name),
      userCount,
      userError,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', error: error?.message || String(error) },
      { status: 503 }
    );
  }
}
