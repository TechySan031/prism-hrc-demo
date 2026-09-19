import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: 'CANDIDATE',
        planTier: 'FREE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        planTier: true,
        createdAt: true,
      },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
