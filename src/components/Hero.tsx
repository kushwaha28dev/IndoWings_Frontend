import React from 'react';
import { DownloadCloud, Radar } from 'lucide-react';

interface HeroProps {
  onOpenCommandCenter: () => void;
  onOpenDemoBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCommandCenter, onOpenDemoBooking }) => {
  return (
    <section id="overview" className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#091827] text-white">
      {/* Exact SkyGrid Hero Background Image with Command Room Telemetry */}
      <img 
        src="/indowings-hero.png" 
        alt="IndoWings UAV Operations Command Center" 
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
      />

      {/* Dark Overlay Gradient (Crisp left-side readability matching SkyGrid) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#091827]/95 via-[#091827]/85 to-transparent pointer-events-none"></div>

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 w-full py-16 sm:py-24">
        <div className="max-w-2xl space-y-6">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#c084fc]">
            ENTERPRISE UAV SOFTWARE COMPANY
          </p>

          {/* Main Headline (Exact 3-line layout from screenshot) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            Enterprise UAV Operations. Unified. Secure. Scalable.
          </h1>

          {/* Hero Copy (IndoWings customized) */}
          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-xl">
            IndoWings helps teams plan missions, operate aircraft, manage fleets, review activity, and keep GCS workstations aligned with Command Center.
          </p>

          {/* Hero Action Buttons (Exact SkyGrid style) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={onOpenCommandCenter}
              className="flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-sm bg-[#3b0080] hover:bg-[#260052] text-white shadow-lg transition-all active:scale-95"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Get GCS</span>
            </button>

            <a 
              href="#architecture"
              className="flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Radar className="w-4 h-4" />
              <span>Explore Platform</span>
            </a>
          </div>

          {/* CTA Helper Line */}
          <p className="text-xs sm:text-[13px] text-slate-300 font-normal pt-1">
            Download page includes version, system requirements, release notes, checksum, and account requirements.
          </p>

          {/* Meta Badges Strip (Exact pill design from screenshot) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            <span className="px-3.5 py-1.5 rounded-md bg-black/50 border border-white/20 text-xs font-semibold text-white backdrop-blur-sm">
              IndoWings GCS v3.4.4
            </span>
            <span className="px-3.5 py-1.5 rounded-md bg-black/50 border border-white/20 text-xs font-semibold text-white backdrop-blur-sm">
              Windows
            </span>
            <span className="px-3.5 py-1.5 rounded-md bg-black/50 border border-white/20 text-xs font-semibold text-white backdrop-blur-sm">
              Stable
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
