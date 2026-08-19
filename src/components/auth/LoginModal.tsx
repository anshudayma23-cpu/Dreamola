'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isLogin) {
      const res = await login('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        onClose();
        // Redirect if redirect query param exists in the URL
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          router.push(redirect);
        }
      }
    } else {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to sign up');
        }

        // Login immediately after signup
        await login('credentials', {
          redirect: false,
          email,
          password,
        });
        onClose();
        // Redirect if redirect query param exists in the URL
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          router.push(redirect);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#11111b] p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-[0_0_40px_rgba(138,43,226,0.1)]">
        
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button 
            className={`flex-1 pb-2 font-semibold transition-colors ${isLogin ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button 
            className={`flex-1 pb-2 font-semibold transition-colors ${!isLogin ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => login('google', { callbackUrl: window.location.search.includes('redirect') ? new URLSearchParams(window.location.search).get('redirect')! : '/' })}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#181445] font-semibold rounded-lg p-3 border border-white/20 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-white/40 uppercase font-semibold">Or</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          
          <div>
            <label className="text-sm text-white/70 mb-1 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm text-white/70 mb-1 block">Username</label>
              <input 
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-white/70 mb-1 block">Password</label>
            <input 
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold rounded-lg p-3 mt-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">
          By continuing you agree to our <a href="/privacy" className="underline hover:text-white/60">Privacy Policy</a>
        </p>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
      </div>
    </div>
  );
}
