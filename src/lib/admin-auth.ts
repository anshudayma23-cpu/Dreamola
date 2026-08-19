import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  if (session.user.isAdmin || session.user.email.toLowerCase() === 'anshudayma23@gmail.com') {
    return session;
  }

  // Fallback DB check
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { isAdmin: true, role: true }
  });

  if (dbUser?.isAdmin || dbUser?.role === 'admin') {
    return session;
  }

  return null;
}
