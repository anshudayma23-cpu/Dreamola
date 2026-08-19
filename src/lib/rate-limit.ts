import { prisma } from './db';
import { PLAN_LIMITS } from './constants';
import { cookies } from 'next/headers';
import { User } from '@prisma/client';

async function ensureLimitsReset(user: User): Promise<User> {
  if (new Date() > user.limitsResetAt) {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        interpretationsUsedToday: 0,
        literalArtUsedToday: 0,
        feelingArtUsedToday: 0,
        limitsResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  }
  return user;
}

export async function checkInterpretationLimit(userId: string | null) {
  if (!userId) {
    const cookieStore = await cookies();
    const anonUsed = cookieStore.get('anon_interpretation_used');
    if (anonUsed) {
      return { allowed: false, remaining: 0, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    }
    return { allowed: true, remaining: 1, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, remaining: 0, resetAt: new Date() };

  // Admin bypass: complete unlimited access
  if (user.isAdmin || user.role === 'admin' || user.email.toLowerCase() === 'anshudayma23@gmail.com') {
    return { allowed: true, remaining: Infinity, resetAt: user.limitsResetAt };
  }

  const resetUser = await ensureLimitsReset(user);

  const limits = PLAN_LIMITS[resetUser.plan];
  const used = resetUser.interpretationsUsedToday;
  const max = limits.meanings;

  return {
    allowed: max === Infinity || used < max,
    remaining: max === Infinity ? Infinity : Math.max(0, max - used),
    resetAt: resetUser.limitsResetAt
  };
}

export async function checkArtLimit(userId: string | null, type: 'literal' | 'feeling') {
  if (!userId) {
    const cookieStore = await cookies();
    const anonUsed = cookieStore.get(`anon_${type}_art_used`);
    if (anonUsed) {
      return { allowed: false, remaining: 0, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    }
    // Allow 1 free generation per category for guest demo
    return { allowed: true, remaining: 1, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, remaining: 0, resetAt: new Date() };

  // Admin bypass: complete unlimited access for art generation
  if (user.isAdmin || user.role === 'admin' || user.email.toLowerCase() === 'anshudayma23@gmail.com') {
    return { allowed: true, remaining: Infinity, resetAt: user.limitsResetAt };
  }

  const resetUser = await ensureLimitsReset(user);

  const limits = PLAN_LIMITS[resetUser.plan];
  const max = type === 'literal' ? limits.literalArt : limits.feelingArt;
  const used = type === 'literal' ? resetUser.literalArtUsedToday : resetUser.feelingArtUsedToday;

  return {
    allowed: max === Infinity || used < max,
    remaining: max === Infinity ? Infinity : Math.max(0, max - used),
    resetAt: resetUser.limitsResetAt
  };
}

export async function incrementInterpretationUsage(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Do not track/limit admins
  if (user.isAdmin || user.role === 'admin' || user.email.toLowerCase() === 'anshudayma23@gmail.com') return;

  const isExpired = new Date() > user.limitsResetAt;

  await prisma.user.update({
    where: { id: userId },
    data: {
      interpretationsUsedToday: isExpired ? 1 : { increment: 1 },
      ...(isExpired ? {
        literalArtUsedToday: 0,
        feelingArtUsedToday: 0,
        limitsResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      } : {})
    }
  });
}

export async function incrementArtUsage(userId: string, type: 'literal' | 'feeling') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Do not track/limit admins
  if (user.isAdmin || user.role === 'admin' || user.email.toLowerCase() === 'anshudayma23@gmail.com') return;

  const isExpired = new Date() > user.limitsResetAt;

  await prisma.user.update({
    where: { id: userId },
    data: {
      literalArtUsedToday: type === 'literal' 
        ? (isExpired ? 1 : { increment: 1 }) 
        : (isExpired ? 0 : undefined),
      feelingArtUsedToday: type === 'feeling' 
        ? (isExpired ? 1 : { increment: 1 }) 
        : (isExpired ? 0 : undefined),
      interpretationsUsedToday: isExpired ? 0 : undefined,
      limitsResetAt: isExpired ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    }
  });
}
