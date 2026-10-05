import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Package, LayoutDashboard, Wrench, Shield, ArrowRight, Lock } from 'lucide-react';
import { DeliveryUser } from './AuthModal';

interface HeaderProps {
  currentUser: DeliveryUser | null;
  onOpenCommandCenter?: () => void;
  onOpenDemoBooking?: () => void;
  onOpenFeedback?: () => void;
  onNavigate?: (page: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const nav = (page: string, url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenDropdown(null);
  };

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-full ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80' : 'bg-white border-b border-slate-200'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 w-full min-w-0">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="/" onClick={nav('home', '/')} className="flex items-center gap-3 group">
            <img src="/indowings-logo-dark.svg" alt="IndoWings" className="h-8 w-auto" />
          </a>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-[11px] font-bold text-[#3b0080]">
            <Lock className="w-3 h-3 text-[#3b0080]" />
            <span>Internal Operations Gateway</span>
          </div>
        </div>

        {/* ── Desktop Nav (Internal Operations Context) ─────────────── */}
        <nav className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Role-Specific Direct Navigation Buttons */}
              {currentUser.role === 'admin' && (
                <div className="hidden md:flex items-center gap-1.5">
                  <a href="/admin" onClick={nav('admin', '/admin')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#3b0080] hover:bg-purple-50 transition-colors">
                    Admin Command
                  </a>
                  <a href="/fleet" onClick={nav('fleet', '/fleet')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-amber-800 hover:bg-amber-50 transition-colors">
                    Fleet &amp; QC
                  </a>
                  <a href="/dispatch" onClick={nav('dispatch', '/dispatch')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-sky-800 hover:bg-sky-50 transition-colors">
                    Dispatcher Board
                  </a>
                </div>
              )}

              {currentUser.role === 'fleet_manager' && (
                <a href="/fleet" onClick={nav('fleet', '/fleet')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 transition-colors">
                  <Wrench className="w-3.5 h-3.5" />
                  Fleet &amp; QC Command
                </a>
              )}

              {currentUser.role === 'dispatcher' && (
                <a href="/dispatch" onClick={nav('dispatch', '/dispatch')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-900 bg-sky-50 border border-sky-200 transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dispatcher Board
                </a>
              )}

              {currentUser.role === 'client' && (
                <a href="/receiving" onClick={nav('receiving', '/receiving')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 transition-colors">
                  <Package className="w-3.5 h-3.5" />
                  Client Receiving Portal
                </a>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3b0080] to-purple-600 flex items-center justify-center text-white text-xs font-black">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden sm:block max-w-[110px] truncate">{currentUser.name}</span>
                </button>

                {openDropdown === 'profile' && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3.5 py-3 mb-1 bg-purple-50/70 rounded-xl">
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                      <span className="inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#3b0080] text-white">
                        {currentUser.role === 'admin' ? '👑 Super Admin' :
                         currentUser.role === 'fleet_manager' ? '🛠️ Fleet Manager' :
                         currentUser.role === 'dispatcher' ? '🚚 Dispatcher' :
                         currentUser.role === 'client' ? '🏢 Client Officer' : 'Personnel'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button onClick={nav('admin', '/admin')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3b0080] hover:bg-purple-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Command Center
                      </button>
                    )}

                    {currentUser.role === 'fleet_manager' && (
                      <button onClick={nav('fleet', '/fleet')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors">
                        <Wrench className="w-4 h-4" />
                        Fleet &amp; QC Command
                      </button>
                    )}

                    {currentUser.role === 'dispatcher' && (
                      <button onClick={nav('dispatch', '/dispatch')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-900 hover:bg-sky-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dispatcher Board
                      </button>
                    )}

                    {currentUser.role === 'client' && (
                      <button onClick={nav('receiving', '/receiving')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-900 hover:bg-emerald-50 transition-colors">
                        <Package className="w-4 h-4" />
                        Client Receiving Portal
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { onLogout?.(); setOpenDropdown(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-black text-white bg-[#3b0080] hover:bg-[#2e0066] px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Personnel Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </nav>

      </div>
    </header>
  );
};
