import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateArt } from '../../../../lib/art-generation';
import { validateDreamRelevancy } from '../../../../lib/interpretation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { checkArtLimit, incrementArtUsage } from '../../../../lib/rate-limit';
import { cookies } from 'next/headers';

const artSchema = z.object({
  dreamText: z.string().min(5).max(5000),
  interpretation: z.string().optional(),
  type: z.enum(['literal', 'feeling']).default('feeling'),
  styleMode: z.enum(['surreal', 'literal']).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const body = await req.json();
    const parsed = artSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }

    const { dreamText, interpretation, type, styleMode } = parsed.data;

    const relevancy = await validateDreamRelevancy(dreamText);
    if (!relevancy.isValid) {
      return NextResponse.json({
        error: relevancy.reason || "We couldn't detect a dream description in your text. Please describe a dream story before generating artwork.",
        isValidDream: false
      }, { status: 400 });
    }

    const limit = await checkArtLimit(userId, type);
    if (!limit.allowed) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded for art generations. Please sign in or upgrade for more generations.', 
        resetAt: limit.resetAt 
      }, { status: 429 });
    }

    const result = await generateArt(dreamText, interpretation, type, styleMode);
    
    if (userId) {
      await incrementArtUsage(userId, type);
    } else {
      const cookieStore = await cookies();
      cookieStore.set(`anon_${type}_art_used`, 'true', {
        maxAge: 24 * 60 * 60,
        httpOnly: true,
        path: '/',
      });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating art:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate art' }, { status: 500 });
  }
}
