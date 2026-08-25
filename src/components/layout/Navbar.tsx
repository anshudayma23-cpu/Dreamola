'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';
import { 
  UserIcon, 
  LogOutIcon, 
  BookOpenIcon, 
  BarChart2, 
  Settings, 
  Sparkles, 
  Crown,
  Menu,
  X,
  Compass,
  Palette,
  CreditCard
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.isAdmin || (user as any)?.role === 'admin' || user?.email?.toLowerCase() === 'anshudayma23@gmail.com';

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'login' && !isAuthenticated) {
        setShowLoginModal(true);
      }
    }
  }, [isAuthenticated]);

  const navLinks = [
    { href: '/dream', label: 'Canvas', icon: Palette },
    { href: '/gallery', label: 'Gallery', icon: Compass },
    { href: '/insights', label: 'Insights', icon: BarChart2 },
    { href: '/journal', label: 'Journal', icon: BookOpenIcon },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1020px] pointer-events-auto flex flex-col items-center gap-2">
        {/* Navbar Main Pill */}
        <div className="w-full flex items-center justify-between px-4 md:px-5 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(30,27,75,0.08)]">
          
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="font-serif text-xl font-bold text-[#630ed4] tracking-tight shrink-0 hover:opacity-90 transition-opacity"
          >
            Dreamola
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-sans transition-all whitespace-nowrap ${
                    isActive 
                      ? 'font-bold text-[#630ed4] bg-[#efebff]' 
                      : 'font-medium text-[#4a4455] hover:text-[#630ed4] hover:bg-[#efebff]/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Account Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-white/90 px-3 md:px-4 py-1.5 rounded-full text-xs font-semibold text-[#181445] border border-[#ccc3d8]/40 hover:bg-white transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#630ed4]" />
                  <span className="max-w-[80px] md:max-w-[120px] truncate">{user?.username || 'Account'}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isAdmin || user?.plan === 'premium'
                      ? 'bg-amber-100 text-amber-800'
                      : user?.plan === 'mid'
                      ? 'bg-[#efebff] text-[#630ed4]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isAdmin ? 'Admin' : user?.plan === 'premium' ? 'Oracle' : user?.plan === 'mid' ? 'Lucid' : 'Free'}
                  </span>
                </button>

                {/* Desktop Account Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-2xl border border-[#ccc3d8]/40 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
                    {isAdmin && (
                      <>
                        <Link 
                          href="/admin" 
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#630ed4] hover:bg-[#efebff]"
                        >
                          <Crown className="w-4 h-4 text-amber-500" /> 
                          <span>Admin Sanctuary</span>
                        </Link>
                        <hr className="my-1 border-t border-gray-100" />
                      </>
                    )}
                    <Link 
                      href="/journal" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#181445] hover:bg-[#efebff]"
                    >
                      <BookOpenIcon className="w-4 h-4 text-[#630ed4]" /> 
                      <span>My Journal</span>
                    </Link>
                    <Link 
                      href="/insights" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#181445] hover:bg-[#efebff]"
                    >
                      <BarChart2 className="w-4 h-4 text-[#630ed4]" /> 
                      <span>Insights</span>
                    </Link>
                    <Link 
                      href="/account" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#181445] hover:bg-[#efebff]"
                    >
                      <Settings className="w-4 h-4 text-[#630ed4]" /> 
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-t border-gray-100" />
                    <button 
                      type="button"
                      onClick={() => { setShowDropdown(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOutIcon className="w-4 h-4" /> 
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="font-sans text-xs md:text-sm font-semibold text-[#630ed4] px-3 md:px-4 py-2 rounded-full hover:bg-[#efebff]/50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>

                <Link
                  href="/dream"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#630ed4] to-[#a855f7] text-white font-sans text-xs font-semibold shadow-md shadow-[#630ed4]/20 hover:opacity-95 transition-opacity whitespace-nowrap"
                >
                  <span>Decode a Dream</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#4a4455] hover:text-[#630ed4] rounded-full hover:bg-[#efebff]/60 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden w-full bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 shadow-2xl flex flex-col gap-2 animate-fadeIn border-t border-gray-100">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#efebff] text-[#630ed4] font-bold' 
                      : 'text-[#4a4455] hover:bg-gray-50 hover:text-[#630ed4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#630ed4]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-amber-50 text-amber-800"
              >
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Admin Sanctuary</span>
              </Link>
            )}

            <hr className="my-1 border-t border-gray-100" />

            <Link
              href="/dream"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#630ed4] to-[#a855f7] text-white font-semibold text-sm shadow-md shadow-[#630ed4]/20"
            >
              <span>Decode a Dream</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

