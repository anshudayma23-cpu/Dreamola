import { NextResponse } from 'next/server';
import { z } from 'zod';
import { interpret } from '../../../../lib/interpretation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { checkInterpretationLimit, incrementInterpretationUsage } from '../../../../lib/rate-limit';
import { cookies } from 'next/headers';

const dreamSchema = z.object({
  dreamText: z.string().min(10).max(5000),
  moodTags: z.array(z.string()).optional(),
  customTags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const limit = await checkInterpretationLimit(userId);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', resetAt: limit.resetAt }, { status: 429 });
    }

    const body = await req.json();
    const parsed = dreamSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }

    const { dreamText } = parsed.data;
    const result = await interpret(dreamText);
    
    if (userId) {
      await incrementInterpretationUsage(userId);
    } else {
      const cookieStore = await cookies();
      cookieStore.set('anon_interpretation_used', 'true', {
        maxAge: 24 * 60 * 60, // 24 hours
        httpOnly: true,
        path: '/',
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error interpreting dream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
