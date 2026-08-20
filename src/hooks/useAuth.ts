'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  let sessionData: { data: any; status: string } = { data: null, status: 'unauthenticated' };
  try {
    sessionData = useSession();
  } catch {
    // Graceful fallback when Next.js prerenders page during build without SessionProvider context
  }

  const session = sessionData?.data;
  const status = sessionData?.status || 'unauthenticated';

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isPremium = user?.plan === 'premium';

  return {
    user,
    isAuthenticated,
    isLoading,
    isPremium,
    login: (provider?: string, options?: any) => signIn(provider, options),
    logout: () => signOut(),
  };
}
