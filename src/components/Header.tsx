import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Clock,
  ChevronDown,
  Zap,
  Navigation,
  BookOpen,
  Headphones,
  Wrench,
  Shield,
  ExternalLink,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // 1. Operations & Role Workspaces (Only for Admin users)
  const OPERATIONS_ITEMS = [
    {
      icon: Shield,
      label: 'Admin Command Console',
      sub: 'User provisioning & role governance',
      page: 'admin',
      url: '/admin',
      accent: true,
      badge: 'Super Admin',
    },
    {
      icon: Wrench,
      label: 'Fleet & Pre-Delivery QC',
      sub: 'Hardware registry & diagnostics',
      page: 'fleet',
      url: '/fleet',
      badge: 'QC Lead',
    },
    {
      icon: LayoutDashboard,
      label: 'Corridor Dispatch Board',
      sub: 'Transit scheduling & escort tracking',
      page: 'dispatch',
      url: '/dispatch',
      badge: 'Dispatch',
    },
    {
      icon: Package,
      label: 'Client Receiving Station',
      sub: 'Arrival checks & digital sign-off',
      page: 'receiving',
      url: '/receiving',
      badge: 'Receiving',
    },
    {
      icon: Headphones,
      label: 'Support & Grievance Desk',
      sub: 'Customer queries, callbacks & tickets',
      page: 'support-desk',
      url: '/support-desk',
      badge: 'Support',
    },
    {
      icon: Zap,
      label: 'Telemetry Command Center',
      sub: 'Live air corridor flight stream',
      page: 'command-center',
      url: '/command-center',
    },
  ];

  // 2. Transit & Tracking
  const TRANSIT_ITEMS = [
    {
      icon: Navigation,
      label: 'Live Corridor Telemetry',
      sub: 'Real-time GPS transit tracking',
      page: 'track',
      url: '/track',
      badge: 'Live',
    },
    {
      icon: Clock,
      label: 'Drone Shipment History',
      sub: 'Dispatches, transit logs & challans',
      page: 'orders',
      url: '/profile?tab=orders',
    },
    {
      icon: ExternalLink,
      label: 'Telemetry Data Exports',
      sub: 'Flight records & sensor logs',
      page: 'downloads',
      url: '/downloads',
    },
  ];

  // 3. Protocols & SOP
  const PROTOCOL_ITEMS = [
    {
      icon: BookOpen,
      label: 'Hardware QC SOP Checklist',
      sub: 'Pre-dispatch technical standards',
      page: 'docs',
      url: '/docs',
    },
    {
      icon: Wrench,
      label: 'Avionics Diagnostics & Fixes',
      sub: 'IMU, RTK & motor calibration',
      page: 'support',
      url: '/support?tab=fix',
    },
    {
      icon: Headphones,
      label: 'Operations Hotline Support',
      sub: '24/7 technical escort desk',
      page: 'support',
      url: '/support',
      badge: '24/7',
    },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-full ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 w-full min-w-0">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="/" onClick={nav('home', '/')} className="flex items-center gap-3 group">
            <img src="/indofleet-logo-dark.svg" alt="IndoFleet" className="h-8 w-auto" />
          </a>
        </div>

        {/* ── Desktop Navigation Menu ───────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-bold text-slate-800" ref={dropdownRef}>

          {/* 1. Operations Desks Dropdown (ONLY visible to Super Admin when logged in) */}
          {currentUser?.role === 'admin' && (
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('operations')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  openDropdown === 'operations'
                    ? 'bg-purple-50 text-[#3b0080]'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#3b0080]" />
                <span>Admin Desks</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'operations' ? 'rotate-180 text-[#3b0080]' : 'text-slate-400'
                  }`}
                />
              </button>

              {openDropdown === 'operations' && (
                <div className="absolute top-full left-0 pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-2">
                    <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Admin Workspace Access
                      </p>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        Super Admin
                      </span>
                    </div>

                    {OPERATIONS_ITEMS.map((item) => (
                      <a
                        key={item.label}
                        href={item.url}
                        onClick={nav(item.page, item.url)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                          item.accent ? 'bg-purple-50/70 hover:bg-purple-100/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.accent
                              ? 'bg-[#3b0080] text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-[#3b0080]'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs font-bold truncate ${
                                item.accent ? 'text-[#3b0080]' : 'text-slate-800'
                              }`}
                            >
                              {item.label}
                            </p>
                            {item.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 group-hover:bg-purple-200 group-hover:text-purple-900 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.sub}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Transit & Tracking Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('transit')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                openDropdown === 'transit'
                  ? 'bg-purple-50 text-[#3b0080]'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Transit &amp; Telemetry</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'transit' ? 'rotate-180 text-[#3b0080]' : 'text-slate-400'
                }`}
              />
            </button>

            {openDropdown === 'transit' && (
              <div className="absolute top-full left-0 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-2">
                  <div className="px-3 pt-2 pb-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Live Telemetry &amp; Logs
                    </p>
                  </div>
                  {TRANSIT_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      onClick={nav(item.page, item.url)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-[#3b0080] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.sub}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Protocols & SOP Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('sop')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                openDropdown === 'sop' ? 'bg-purple-50 text-[#3b0080]' : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Protocols &amp; SOP</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'sop' ? 'rotate-180 text-[#3b0080]' : 'text-slate-400'
                }`}
              />
            </button>

            {openDropdown === 'sop' && (
              <div className="absolute top-full left-0 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-2">
                  <div className="px-3 pt-2 pb-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Standard Operating Procedures
                    </p>
                  </div>
                  {PROTOCOL_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      onClick={nav(item.page, item.url)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-[#3b0080] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.sub}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct Link: Company / Platform */}
          <a
            href="/company"
            onClick={nav('company', '/company')}
            className="px-3.5 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-bold"
          >
            IndoWings Aerospace
          </a>
        </nav>

        {/* ── Right Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">

          {/* Quick Track Transit Pill */}
          <a
            href="/track"
            onClick={nav('track', '/track')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#3b0080] hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-purple-600" />
            <span>Track Transit</span>
          </a>

          {/* User Auth / Profile Dropdown */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3b0080] to-purple-600 flex items-center justify-center text-white text-xs font-black">
                  {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {currentUser.name?.split(' ')[0]}
                  </p>
                  <p className="text-[10px] font-semibold text-purple-700 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    openDropdown === 'profile' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'profile' && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3.5 py-3 mb-1 bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b0080] to-purple-600 flex items-center justify-center text-white text-sm font-black">
                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#171222] truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUser.email || currentUser.phone}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide bg-[#3b0080] text-white">
                        {currentUser.role === 'admin'
                          ? '👑 Super Admin'
                          : currentUser.role === 'fleet_manager'
                          ? '🛠️ Fleet Manager'
                          : currentUser.role === 'dispatcher'
                          ? '🚚 Dispatcher'
                          : currentUser.role === 'client'
                          ? '🏢 Client Officer'
                          : currentUser.role === 'support'
                          ? '🎧 Support Desk Officer'
                          : 'Staff'}
                      </span>
                    </div>
                  </div>

                  {/* Direct Dedicated Workspace Link */}
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={nav('admin', '/admin')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-purple-50 text-[#3b0080] text-xs font-bold transition-colors mb-1"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Command Console
                    </button>
                  )}

                  {currentUser.role === 'fleet_manager' && (
                    <button
                      onClick={nav('fleet', '/fleet')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold transition-colors mb-1"
                    >
                      <Wrench className="w-4 h-4" />
                      Fleet &amp; QC Command
                    </button>
                  )}

                  {currentUser.role === 'dispatcher' && (
                    <button
                      onClick={nav('dispatch', '/dispatch')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sky-50 text-sky-900 text-xs font-bold transition-colors mb-1"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dispatcher Board
                    </button>
                  )}

                  {currentUser.role === 'client' && (
                    <button
                      onClick={nav('receiving', '/receiving')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold transition-colors mb-1"
                    >
                      <Package className="w-4 h-4" />
                      Client Receiving Portal
                    </button>
                  )}

                  {currentUser.role === 'support' && (
                    <button
                      onClick={nav('support-desk', '/support-desk')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-purple-50 text-[#3b0080] text-xs font-bold transition-colors mb-1"
                    >
                      <Headphones className="w-4 h-4" />
                      Support Command Desk
                    </button>
                  )}

                  <button
                    onClick={nav('orders', '/profile?tab=orders')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    Shipment History
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        onLogout?.();
                        setOpenDropdown(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-bold text-white bg-[#3b0080] hover:bg-[#2c0060] px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Only Super Admin sees full Operations in Mobile */}
          {currentUser?.role === 'admin' && (
            <>
              <div className="px-3 py-1 mb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Admin Command Desks
                </p>
              </div>
              {OPERATIONS_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  onClick={nav(item.page, item.url)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    item.accent ? 'bg-purple-50 text-[#3b0080]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{item.label}</span>
                </a>
              ))}
            </>
          )}

          {/* If another role is logged in, show their dedicated desk in mobile */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="px-3 py-2 mb-2 bg-purple-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-700 mb-1">
                Your Operational Desk
              </p>
              {currentUser.role === 'fleet_manager' && (
                <a
                  href="/fleet"
                  onClick={nav('fleet', '/fleet')}
                  className="flex items-center gap-2 text-xs font-bold text-[#3b0080]"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Fleet &amp; QC Command</span>
                </a>
              )}
              {currentUser.role === 'dispatcher' && (
                <a
                  href="/dispatch"
                  onClick={nav('dispatch', '/dispatch')}
                  className="flex items-center gap-2 text-xs font-bold text-[#3b0080]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Corridor Dispatch Board</span>
                </a>
              )}
              {currentUser.role === 'client' && (
                <a
                  href="/receiving"
                  onClick={nav('receiving', '/receiving')}
                  className="flex items-center gap-2 text-xs font-bold text-[#3b0080]"
                >
                  <Package className="w-4 h-4" />
                  <span>Client Receiving Station</span>
                </a>
              )}
              {currentUser.role === 'support' && (
                <a
                  href="/support-desk"
                  onClick={nav('support-desk', '/support-desk')}
                  className="flex items-center gap-2 text-xs font-bold text-[#3b0080]"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Support &amp; Grievance Desk</span>
                </a>
              )}
            </div>
          )}

          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Transit &amp; Telemetry
            </p>
          </div>
          {TRANSIT_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.url}
              onClick={nav(item.page, item.url)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <item.icon className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{item.label}</span>
            </a>
          ))}

          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Protocols &amp; SOP
            </p>
          </div>
          {PROTOCOL_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.url}
              onClick={nav(item.page, item.url)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <item.icon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{item.label}</span>
            </a>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#3b0080] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <User className="w-4 h-4" />
                <span>Personnel Portal Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
