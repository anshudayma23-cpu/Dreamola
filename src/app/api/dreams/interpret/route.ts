import { NextResponse } from 'next/server';
import { z } from 'zod';
import { interpret } from '../../../../lib/interpretation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { checkInterpretationLimit, incrementInterpretationUsage } from '../../../../lib/rate-limit';
import { cookies } from 'next/headers';

const dreamSchema = z.object({
  dreamText: z.string().min(5).max(5000),
  moodTags: z.array(z.string()).optional(),
  customTags: z.array(z.string()).optional(),
  depthMode: z.enum(['deep', 'surface']).optional(),
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

    const { dreamText, depthMode } = parsed.data;
    const result = await interpret(dreamText, depthMode);
    
    if (result.isValidDream === false) {
      return NextResponse.json({
        error: result.message || "Invalid dream description.",
        isValidDream: false
      }, { status: 400 });
    }

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
