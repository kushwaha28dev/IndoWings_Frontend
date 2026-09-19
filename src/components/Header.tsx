import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, Package, LayoutDashboard, MapPin, Clock, ChevronDown, Zap, Navigation, BookOpen, Building2, MessageSquare, Shield, Headphones, Wrench } from 'lucide-react';
import { DeliveryUser } from './AuthModal';

interface HeaderProps {
  currentUser: DeliveryUser | null;
  onOpenCommandCenter: () => void;
  onOpenDemoBooking: () => void;
  onOpenFeedback?: () => void;
  onNavigate?: (page: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandCenter,
  onOpenDemoBooking,
  onOpenFeedback,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        if (openDropdown === 'profile') setOpenDropdown(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (openDropdown && openDropdown !== 'profile') setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  const nav = (page: string, url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const DELIVERY_ITEMS = [
    { icon: Package, label: 'Book Delivery', sub: 'Instant drone dispatch', page: 'order', url: '/order', accent: true },
    { icon: Navigation, label: 'Track Order', sub: 'Live flight telemetry', page: 'track', url: '/track' },
    { icon: Clock, label: 'My Orders', sub: 'History & status', page: 'orders', url: '/profile?tab=orders' },
    { icon: MapPin, label: 'My Profile', sub: 'Addresses & settings', page: 'profile', url: '/profile' },
  ];

  const RESOURCE_ITEMS = [
    { icon: BookOpen, label: 'Documentation', sub: 'API & integration docs', page: 'docs', url: '/docs' },
    { icon: Building2, label: 'Company', sub: 'About IndoWings', page: 'company', url: '/company' },
    { icon: MessageSquare, label: 'Feedback & Reviews', sub: 'Rate your experience', page: 'feedback', url: '/feedback' },
  ];

  const SUPPORT_ITEMS = [
    { icon: Headphones, label: 'Talk to Expert', sub: 'Live flight engineer callback', page: 'support', url: '/support?tab=expert', badge: 'Live' },
    { icon: BookOpen, label: 'Customer Guide', sub: 'Drone delivery user manual', page: 'support', url: '/support?tab=guide' },
    { icon: Wrench, label: 'Fix & Troubleshoot', sub: 'Self-serve issue resolver', page: 'support', url: '/support?tab=fix' },
  ];

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080214]/85 backdrop-blur-2xl shadow-2xl shadow-black/40 border-b border-white/[0.08]' : 'bg-[#0a0319]/70 backdrop-blur-xl border-b border-white/[0.06]'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <a href="/" onClick={nav('home', '/')} className="flex items-center gap-3 group shrink-0">
          <img src="/indowings-logo-white.svg" alt="IndoWings" className="h-8 w-auto object-contain" />
        </a>

        {/* ── Desktop Nav ───────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-slate-300" ref={dropdownRef}>

          {/* Delivery Dropdown */}
          <div className="relative" onMouseEnter={() => setOpenDropdown('delivery')} onMouseLeave={() => setOpenDropdown(null)}>
            <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${openDropdown === 'delivery' ? 'bg-white/[0.08] text-purple-300' : 'hover:bg-white/[0.06] hover:text-white'}`}>
              Delivery
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'delivery' ? 'rotate-180 text-purple-300' : 'text-slate-400'}`} />
            </button>
            {openDropdown === 'delivery' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-72 bg-[#12072b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pt-2 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300/80">Drone Delivery Services</p>
                </div>
                {DELIVERY_ITEMS.map(item => (
                  <a key={item.label} href={item.url} onClick={nav(item.page, item.url)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${item.accent ? 'bg-purple-600/20 hover:bg-purple-600/30' : 'hover:bg-white/[0.06]'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.accent ? 'bg-purple-600 text-white shadow-md' : 'bg-white/[0.06] text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${item.accent ? 'text-purple-200' : 'text-slate-200 group-hover:text-white'}`}>{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </a>
                ))}
                {currentUser?.role === 'admin' && (
                  <a href="/dispatch" onClick={nav('dispatch', '/dispatch')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all group mt-1 border-t border-white/[0.06]">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Dispatch Board</p>
                      <p className="text-xs text-slate-400">Admin · Fleet management</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Support Dropdown */}
          <div className="relative" onMouseEnter={() => setOpenDropdown('support')} onMouseLeave={() => setOpenDropdown(null)}>
            <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${openDropdown === 'support' ? 'bg-white/[0.08] text-purple-300' : 'hover:bg-white/[0.06] hover:text-white'}`}>
              Support
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'support' ? 'rotate-180 text-purple-300' : 'text-slate-400'}`} />
            </button>
            {openDropdown === 'support' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-72 bg-[#12072b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pt-2 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300/80">Help &amp; Operations Desk</p>
                </div>
                {SUPPORT_ITEMS.map(item => (
                  <a key={item.label} href={item.url} onClick={nav(item.page, item.url)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{item.label}</p>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative" onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}>
            <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${openDropdown === 'resources' ? 'bg-white/[0.08] text-purple-300' : 'hover:bg-white/[0.06] hover:text-white'}`}>
              Resources
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'resources' ? 'rotate-180 text-purple-300' : 'text-slate-400'}`} />
            </button>
            {openDropdown === 'resources' && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-64 bg-[#12072b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pt-2 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300/80">Company &amp; Docs</p>
                </div>
                {RESOURCE_ITEMS.map(item => (
                  <a key={item.label} href={item.url} onClick={nav(item.page, item.url)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/company" onClick={nav('company', '/company')} className="px-3.5 py-2 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all">
            Company
          </a>
        </nav>

        {/* ── Right Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">

          {/* Track Order — quick pill */}
          <a href="/track" onClick={nav('track', '/track')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            <Navigation className="w-4 h-4 text-purple-400" />
            Track
          </a>

          {/* Auth / Profile */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:border-purple-400/50 hover:bg-white/[0.08] transition-all">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                  {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-white hidden sm:block max-w-[90px] truncate">{currentUser.name?.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === 'profile' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'profile' && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-[#12072b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3.5 py-3 mb-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md">
                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUser.email || currentUser.phone}</p>
                      </div>
                    </div>
                    {currentUser.role === 'admin' && (
                      <span className="inline-block mt-2 text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full tracking-wide">ADMIN</span>
                    )}
                  </div>
                  {[
                    { icon: User, label: 'My Profile', page: 'profile', url: '/profile' },
                    { icon: Clock, label: 'My Orders', page: 'orders', url: '/profile?tab=orders' },
                    { icon: Package, label: 'Book Delivery', page: 'order', url: '/order' },
                    { icon: Navigation, label: 'Track Order', page: 'track', url: '/track' },
                  ].map(i => (
                    <button key={i.label} onClick={nav(i.page, i.url)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-colors">
                      <i.icon className="w-4 h-4 text-slate-400" />
                      {i.label}
                    </button>
                  ))}
                  {currentUser.role === 'admin' && (
                    <button onClick={nav('dispatch', '/dispatch')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dispatch Board
                    </button>
                  )}
                  <div className="border-t border-white/[0.08] mt-1 pt-1">
                    <button onClick={() => { onLogout?.(); setOpenDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-200 border border-white/20 hover:border-purple-400 hover:bg-purple-500/10 hover:text-white px-4 py-2 rounded-xl transition-all">
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}

          {/* Primary CTA */}
          <button onClick={() => { onNavigate?.('order'); window.history.pushState({}, '', '/order'); window.scrollTo({ top: 0 }); }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all active:scale-95">
            <Package className="w-4 h-4" />
            <span className="hidden sm:block">Book Now</span>
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-white/[0.06] transition-colors ml-1">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0319]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-4 space-y-1 shadow-2xl">
          {[
            { label: 'Book Delivery', page: 'order', url: '/order', accent: true },
            { label: 'Track Order', page: 'track', url: '/track' },
            { label: 'My Orders', page: 'orders', url: '/profile?tab=orders' },
            { label: 'My Profile', page: 'profile', url: '/profile' },
            { label: 'Support & Expert', page: 'support', url: '/support' },
            { label: 'Documentation', page: 'docs', url: '/docs' },
            { label: 'Company', page: 'company', url: '/company' },
            { label: 'Feedback & Reviews', page: 'feedback', url: '/feedback' },
          ].map(item => (
            <a key={item.label} href={item.url} onClick={nav(item.page, item.url)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${item.accent ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'}`}>
              {item.label}
            </a>
          ))}
          {currentUser?.role === 'admin' && (
            <a href="/dispatch" onClick={nav('dispatch', '/dispatch')} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/[0.06]">
              Dispatch Board
            </a>
          )}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {currentUser ? (
              <button onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10">
                Sign Out
              </button>
            ) : (
              <button onClick={() => { onOpenAuth?.(); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/[0.06]">
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
