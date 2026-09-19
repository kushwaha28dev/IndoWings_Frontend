import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, User, LogOut, Package, LayoutDashboard, MapPin, Clock } from 'lucide-react';
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
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        if (openDropdown === 'profile') setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

  const nav = (page: string, url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#e2e8f0] shadow-sm py-3.5 transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <a href="/" onClick={nav('home', '/')} className="flex items-center gap-3 group">
          <img src="/indowings-logo-dark.svg" alt="IndoWings Logo" className="h-8 sm:h-9 w-auto object-contain" />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#1e293b]">
          {/* Product */}
          <div className="relative" onMouseLeave={() => setOpenDropdown(null)}>
            <button onClick={() => toggleDropdown('product')} onMouseEnter={() => setOpenDropdown('product')}
              className="flex items-center gap-1.5 py-1.5 hover:text-[#3b0080] transition-colors focus:outline-none">
              <span>Product</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'product' && (
              <div className="absolute top-full left-0 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <a href="/" onClick={nav('home', '/')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Overview</a>
                <a href="/platform" onClick={nav('platform', '/platform')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">How IndoWings Works</a>
                <a href="/command-center" onClick={nav('command-center', '/command-center')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Command Center</a>
                <a href="/gcs" onClick={nav('gcs', '/gcs')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">IndoWings GCS</a>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="relative" onMouseLeave={() => setOpenDropdown(null)}>
            <button onClick={() => toggleDropdown('delivery')} onMouseEnter={() => setOpenDropdown('delivery')}
              className="flex items-center gap-1.5 py-1.5 hover:text-[#3b0080] transition-colors focus:outline-none">
              <span>Delivery</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'delivery' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'delivery' && (
              <div className="absolute top-full left-0 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <a href="/order" onClick={nav('order', '/order')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Place Delivery Order</a>
                <a href="/profile?tab=orders" onClick={nav('orders', '/profile?tab=orders')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">My Orders & History</a>
                <a href="/track" onClick={nav('track', '/track')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Track Order</a>
                <a href="/profile" onClick={nav('profile', '/profile')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">My Profile & Addresses</a>
                {currentUser?.role === 'admin' && (
                  <a href="/dispatch" onClick={nav('dispatch', '/dispatch')} className="block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Dispatch Board</a>
                )}
              </div>
            )}
          </div>

          {/* Downloads */}
          <div className="relative" onMouseLeave={() => setOpenDropdown(null)}>
            <button onClick={() => toggleDropdown('downloads')} onMouseEnter={() => setOpenDropdown('downloads')}
              className="flex items-center gap-1.5 py-1.5 hover:text-[#3b0080] transition-colors focus:outline-none">
              <span>Downloads</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'downloads' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'downloads' && (
              <div className="absolute top-full left-0 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button onClick={() => { onNavigate?.('downloads'); window.history.pushState({}, '', '/downloads'); setOpenDropdown(null); }} className="w-full text-left block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Latest IndoWings GCS</button>
                <button onClick={() => { onNavigate?.('versions'); window.history.pushState({}, '', '/versions'); setOpenDropdown(null); }} className="w-full text-left block px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">Version Archive</button>
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="relative" onMouseLeave={() => setOpenDropdown(null)}>
            <button onClick={() => toggleDropdown('resources')} onMouseEnter={() => setOpenDropdown('resources')}
              className="flex items-center gap-1.5 py-1.5 hover:text-[#3b0080] transition-colors focus:outline-none">
              <span>Resources</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openDropdown === 'resources' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'resources' && (
              <div className="absolute top-full left-0 w-64 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <a href="/docs" onClick={nav('docs', '/docs')} className="block px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                  Documentation
                </a>
                <a href="/company" onClick={nav('company', '/company')} className="block px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                  Company
                </a>
                <a href="/feedback" onClick={nav('feedback', '/feedback')} className="block px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                  Feedback & Reviews
                </a>

                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-3.5 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Guides & Operations
                </div>
                <a href="/support?tab=expert" onClick={nav('support', '/support?tab=expert')} className="flex items-center justify-between px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-xs font-semibold transition-colors">
                  <span>Talk to Expert</span>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Live</span>
                </a>
                <a href="/support?tab=guide" onClick={nav('support', '/support?tab=guide')} className="block px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-xs font-semibold transition-colors">
                  Customer Guide
                </a>
                <a href="/support?tab=fix" onClick={nav('support', '/support?tab=fix')} className="block px-3.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-xs font-semibold transition-colors">
                  Fix & Troubleshoot Guide
                </a>
              </div>
            )}
          </div>

          <a href="/support" onClick={nav('support', '/support')} className="flex items-center gap-1.5 py-1.5 hover:text-[#3b0080] transition-colors font-medium">
            <span>Support</span>
          </a>
        </nav>

        {/* Right: Auth + Get GCS */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            /* Profile Dropdown */
            <div className="relative" ref={profileRef}>
              <button onClick={() => toggleDropdown('profile')}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-[#e2e8f0] hover:border-[#3b0080]/30 hover:bg-purple-50 transition-all">
                <div className="w-7 h-7 rounded-full bg-[#3b0080] flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-[#171222] hidden sm:block max-w-[100px] truncate">{currentUser.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'profile' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'profile' && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3.5 py-3 border-b border-[#f1f5f9] mb-1">
                    <p className="text-sm font-bold text-[#171222] truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    {currentUser.role === 'admin' && (
                      <span className="inline-block mt-1 text-[10px] font-bold bg-[#3b0080] text-white px-2 py-0.5 rounded-full">ADMIN</span>
                    )}
                  </div>
                  <button onClick={nav('profile', '/profile')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                    <User className="w-4 h-4" /> My Profile & Addresses
                  </button>
                  <button onClick={nav('orders', '/profile?tab=orders')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-[#3b0080] font-bold text-sm transition-colors">
                    <Clock className="w-4 h-4" /> My Orders & History
                  </button>
                  <button onClick={nav('order', '/order')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                    <Package className="w-4 h-4" /> Place Delivery Order
                  </button>
                  <button onClick={nav('track', '/track')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                    <MapPin className="w-4 h-4" /> Track My Orders
                  </button>
                  {currentUser.role === 'admin' && (
                    <button onClick={nav('dispatch', '/dispatch')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-[#3b0080] text-sm font-medium transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dispatch Board
                    </button>
                  )}
                  <div className="border-t border-[#f1f5f9] mt-1 pt-1">
                    <button onClick={() => { onLogout?.(); setOpenDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth}
              className="flex items-center gap-2 text-sm font-semibold text-[#3b0080] border border-[#3b0080]/30 hover:border-[#3b0080] hover:bg-purple-50 px-4 py-2 rounded-lg transition-all">
              <User className="w-4 h-4" />
              <span className="hidden sm:block">Sign In</span>
            </button>
          )}

          <button onClick={onOpenCommandCenter}
            className="bg-[#3b0080] hover:bg-[#260052] text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>Get GCS</span>
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-700 hover:text-black">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#e2e8f0] px-6 py-4 space-y-3 shadow-lg">
          <a href="/" onClick={nav('home', '/')} className="block py-2 text-slate-700 font-medium">Overview</a>
          <a href="/order" onClick={nav('order', '/order')} className="block py-2 text-slate-700 font-medium">Place Delivery Order</a>
          <a href="/profile?tab=orders" onClick={nav('orders', '/profile?tab=orders')} className="block py-2 text-slate-700 font-medium">My Orders & History</a>
          <a href="/track" onClick={nav('track', '/track')} className="block py-2 text-slate-700 font-medium">Track Order</a>
          <a href="/profile" onClick={nav('profile', '/profile')} className="block py-2 text-slate-700 font-medium">My Profile & Addresses</a>
          <a href="/support" onClick={nav('support', '/support')} className="block py-2 text-[#3b0080] font-semibold flex items-center justify-between">
            <span>Support & Guides</span>
            <span className="text-xs bg-purple-100 text-[#3b0080] px-2 py-0.5 rounded-full font-bold">Expert / Guide</span>
          </a>
          <a href="/company" onClick={nav('company', '/company')} className="block py-2 text-slate-700 font-medium">Company</a>
          <a href="/docs" onClick={nav('docs', '/docs')} className="block py-2 text-slate-700 font-medium">Documentation</a>
          <a href="/feedback" onClick={nav('feedback', '/feedback')} className="block py-2 text-slate-700 font-medium">Feedback & Reviews</a>
          {currentUser ? (
            <button onClick={() => { onLogout?.(); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-red-600 font-medium">Sign Out</button>
          ) : (
            <button onClick={() => { onOpenAuth?.(); setMobileMenuOpen(false); }} className="w-full text-center py-2.5 rounded-lg border border-[#3b0080] text-[#3b0080] font-bold text-sm">Sign In</button>
          )}
          <button onClick={() => { setMobileMenuOpen(false); onOpenCommandCenter(); }} className="w-full text-center py-2.5 rounded-lg bg-[#3b0080] text-white font-bold text-sm">Get GCS</button>
        </div>
      )}
    </header>
  );
};
