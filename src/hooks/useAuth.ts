'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

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
