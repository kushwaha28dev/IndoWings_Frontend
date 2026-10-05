import React from 'react';
import { Shield, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const navTo = (page: string, url: string, hash?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
    window.history.pushState({}, '', hash ? `${url}#${hash}` : url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#080b11] text-slate-300 pt-16 pb-12 px-4 sm:px-8 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/[0.06]">
      {/* Subtle dot matrix background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Atmospheric aerospace glows */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[250px] bg-purple-600/[0.08] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[250px] bg-indigo-600/[0.07] blur-[110px] rounded-full pointer-events-none" />

      {/* Watermark */}
      <div className="absolute bottom-2 sm:bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none flex justify-center items-end z-0">
        <span
          className="font-black tracking-tighter leading-none whitespace-nowrap text-transparent font-['Space_Grotesk',sans-serif]"
          style={{
            fontSize: 'clamp(70px, 17vw, 240px)',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.06)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 75%, transparent 100%)',
            WebkitBackgroundClip: 'text',
            letterSpacing: '-0.04em',
            transform: 'translateY(14%)',
          }}
        >
          indowings
        </span>
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto">
        {/* Top bar: Brand + Security Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 border-b border-white/[0.07]">
          <div className="max-w-xl">
            <a href="/" onClick={navTo('home', '/')} className="inline-flex items-center gap-3">
              <img
                src="/indowings-logo-white.svg"
                alt="IndoWings"
                className="h-7 w-auto object-contain"
              />
            </a>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              IndoWings Enterprise UAV Fleet Logistics &amp; Handover Hub. Confidential operations infrastructure governing factory assembly diagnostics, corridor dispatch, and technical acceptance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Network Active · 2FA Enforced</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Internal Personnel Only</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {/* Column 1: Operations Workspaces */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white/90 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Operations Desks
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="/login" onClick={navTo('login', '/login')} className="hover:text-white transition-colors">
                  Personnel OTP Login
                </a>
              </li>
              <li>
                <a href="/admin" onClick={navTo('admin', '/admin')} className="hover:text-white transition-colors">
                  Super Admin Console
                </a>
              </li>
              <li>
                <a href="/fleet" onClick={navTo('fleet', '/fleet')} className="hover:text-white transition-colors">
                  Fleet &amp; Pre-Delivery QC
                </a>
              </li>
              <li>
                <a href="/dispatch" onClick={navTo('dispatch', '/dispatch')} className="hover:text-white transition-colors">
                  Corridor Dispatch Board
                </a>
              </li>
              <li>
                <a href="/receiving" onClick={navTo('receiving', '/receiving')} className="hover:text-white transition-colors">
                  Client Receiving Station
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Transit & Telemetry */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white/90 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Transit &amp; Telemetry
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="/track" onClick={navTo('track', '/track')} className="hover:text-white transition-colors">
                  Live Drone Transit Tracking
                </a>
              </li>
              <li>
                <a href="/command-center" onClick={navTo('command-center', '/command-center')} className="hover:text-white transition-colors">
                  Telemetry Command Center
                </a>
              </li>
              <li>
                <a href="/downloads" onClick={navTo('downloads', '/downloads')} className="hover:text-white transition-colors">
                  Telemetry Log Exports
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Protocols & Specifications */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white/90 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              SOP Protocols
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="/docs" onClick={navTo('docs', '/docs')} className="hover:text-white transition-colors">
                  Hardware QC SOP Checklist
                </a>
              </li>
              <li>
                <a href="/support" onClick={navTo('support', '/support')} className="hover:text-white transition-colors">
                  Internal Operations Helpdesk
                </a>
              </li>
              <li>
                <a href="/support?tab=fix" onClick={navTo('support', '/support?tab=fix')} className="hover:text-white transition-colors">
                  Hardware Diagnostics &amp; Fixes
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Governance */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white/90 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Compliance
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-300">DGCA Type Certified</span>
              </li>
              <li>
                <span className="text-slate-300">NPNT Airspace Governance</span>
              </li>
              <li>
                <a href="/legal#security" onClick={navTo('legal', '/legal', 'security')} className="hover:text-white transition-colors">
                  Security Disclosure
                </a>
              </li>
              <li>
                <a href="/legal#privacy" onClick={navTo('legal', '/legal', 'privacy')} className="hover:text-white transition-colors">
                  Internal Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} IndoWings Aerospace Technologies Ltd. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">Confidential · Authorized Internal Personnel Access Only</p>
        </div>
      </div>
    </footer>
  );
};
