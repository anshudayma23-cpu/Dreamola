'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';
import { UserIcon, LogOutIcon, BookOpenIcon, BarChart2, Settings, Sparkles, Crown } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdmin = user?.isAdmin || (user as any)?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'login' && !isAuthenticated) {
        setShowLoginModal(true);
      }
    }
  }, [isAuthenticated]);

  const navLinks = [
    { href: '/dream', label: 'Canvas' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/insights', label: 'Insights' },
    { href: '/journal', label: 'Journal' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <>
      <header 
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          width: 'calc(100% - 32px)',
          maxWidth: '1020px',
          pointerEvents: 'auto',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '6px 12px 6px 20px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(30, 27, 75, 0.08)',
          }}
        >
          {/* Left: Brand + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
            {/* Logo */}
            <Link 
              href="/" 
              style={{
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                fontSize: '20px',
                fontWeight: 700,
                color: '#630ed4',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Dreamola
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#630ed4' : '#4a4455',
                      backgroundColor: isActive ? '#efebff' : 'transparent',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#630ed4';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 235, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#4a4455';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.8)', padding: '6px 14px',
                    borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
                    color: '#181445', border: '1px solid rgba(204,195,216,0.4)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <UserIcon style={{ width: '14px', height: '14px', color: '#630ed4' }} />
                  <span>{user?.username || 'Account'}</span>
                  <span style={{
                    fontSize: '9px', padding: '2px 6px', borderRadius: '9999px',
                    fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    ...(isAdmin 
                      ? { color: '#92400e', backgroundColor: '#fef3c7' }
                      : user?.plan === 'premium' 
                      ? { color: '#92400e', backgroundColor: '#fef3c7' }
                      : user?.plan === 'mid'
                      ? { color: '#630ed4', backgroundColor: '#efebff' }
                      : { color: '#4a4455', backgroundColor: '#f3f4f6' })
                  }}>
                    {isAdmin ? 'Admin' : user?.plan === 'premium' ? 'Oracle' : user?.plan === 'mid' ? 'Lucid' : 'Free'}
                  </span>
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, marginTop: '8px', width: '210px',
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(204,195,216,0.4)', borderRadius: '16px',
                    padding: '8px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', zIndex: 50,
                    whiteSpace: 'normal',
                  }}>
                    {isAdmin && (
                      <>
                        <Link href="/admin" onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-[#efebff]"
                          style={{ fontSize: '12px', fontWeight: 600, color: '#630ed4', textDecoration: 'none' }}>
                          <Crown style={{ width: '16px', height: '16px', color: '#d97706' }} /> Admin Sanctuary
                        </Link>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(204,195,216,0.3)', margin: '4px 0' }} />
                      </>
                    )}
                    <Link href="/journal" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-[#efebff]"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#181445', textDecoration: 'none' }}>
                      <BookOpenIcon style={{ width: '16px', height: '16px', color: '#630ed4' }} /> My Journal
                    </Link>
                    <Link href="/insights" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-[#efebff]"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#181445', textDecoration: 'none' }}>
                      <BarChart2 style={{ width: '16px', height: '16px', color: '#630ed4' }} /> Insights
                    </Link>
                    <Link href="/account" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-[#efebff]"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#181445', textDecoration: 'none' }}>
                      <Settings style={{ width: '16px', height: '16px', color: '#630ed4' }} /> Settings
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(204,195,216,0.3)', margin: '4px 0' }} />
                    <button onClick={() => { setShowDropdown(false); logout(); }}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-red-50"
                      style={{ width: '100%', fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
                      <LogOutIcon style={{ width: '16px', height: '16px' }} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
                    fontSize: '14px', fontWeight: 600, lineHeight: '1',
                    color: '#630ed4', padding: '8px 16px', borderRadius: '9999px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </button>
                <Link
                  href="/dream"
                  className="hidden md:flex"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #630ed4 0%, #a855f7 100%)',
                    boxShadow: '0 4px 14px rgba(99, 14, 212, 0.25)',
                    color: '#ffffff',
                    fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
                    fontSize: '13px', fontWeight: 600, lineHeight: '1',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  <span>Decode a Dream</span>
                  <Sparkles style={{ width: '14px', height: '14px' }} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
