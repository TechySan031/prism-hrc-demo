import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-prism-signature');
    const secret = process.env.INTEGRATION_SHARED_SECRET || 'prism_hrc_internal_shared_secret_token_98765';

    const bodyText = await req.text();

    if (signature) {
      const expectedSignature = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(bodyText);
    const { externalUserId, email, name } = body;

    if (!email || !externalUserId) {
      return NextResponse.json({ error: 'email and externalUserId are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find by externalUserId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ externalUserId }, { email: normalizedEmail }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          externalUserId,
          name: name || user.name,
        },
      });
    } else {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name || 'Prism HRC Candidate',
          externalUserId,
          role: 'CANDIDATE',
          planTier: 'PRO',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        externalUserId: user.externalUserId,
        planTier: user.planTier,
      },
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json({ error: 'User synchronization failed' }, { status: 500 });
  }
}
