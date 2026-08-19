import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { plan, isAdmin, role, resetLimits } = body;

    const dataToUpdate: any = {};
    if (plan && ['free', 'mid', 'premium'].includes(plan)) {
      dataToUpdate.plan = plan;
    }
    if (typeof isAdmin === 'boolean') {
      dataToUpdate.isAdmin = isAdmin;
      dataToUpdate.role = isAdmin ? 'admin' : 'user';
    }
    if (role && ['admin', 'user'].includes(role)) {
      dataToUpdate.role = role;
      dataToUpdate.isAdmin = role === 'admin';
    }
    if (resetLimits) {
      dataToUpdate.interpretationsUsedToday = 0;
      dataToUpdate.literalArtUsedToday = 0;
      dataToUpdate.feelingArtUsedToday = 0;
      dataToUpdate.limitsResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        username: true,
        plan: true,
        isAdmin: true,
        role: true,
        interpretationsUsedToday: true,
        literalArtUsedToday: true,
        feelingArtUsedToday: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
