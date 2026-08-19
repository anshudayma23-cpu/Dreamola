import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.dream.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Dream deleted by admin' });
  } catch (error: any) {
    console.error('Admin delete dream error:', error);
    return NextResponse.json({ error: 'Failed to delete dream' }, { status: 500 });
  }
}
