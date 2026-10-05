import React, { useState, useEffect } from 'react';
import { Package, Navigation, ArrowRight, Shield, CheckCircle2, Lock, Wrench, LayoutDashboard, ChevronRight } from 'lucide-react';
import { InteractiveDrone } from './InteractiveDrone';
import { ElevationMeshBackground } from './ElevationMeshBackground';

interface HeroProps {
  onOpenCommandCenter?: () => void;
  onOpenDemoBooking?: () => void;
  onNavigate?: (page: string) => void;
}

const FLEET_MODELS = [
  'Cyberone Max (Heavy Cargo UAV & Winch)',
  'IndoHawk Alpha (High-Altitude Tactical Recon)',
  'StealthPro VTOL (Long-Range Fixed-Wing Hybrid)',
  'AgriWing X (Precision Industrial Agricultural UAV)',
  'SkyPatrol Recon (Tactical Rapid-Deploy Quadcopter)',
];

const ROLES_OVERVIEW = [
  {
    role: 'Super Admin',
    path: '/admin',
    icon: Shield,
    badge: 'Security Level 1',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    title: 'Admin Command Console',
    desc: 'Provision authorized personnel IDs, manage role-based credentials, configure transit corridors, and audit global fleet deliveries.',
    cta: 'Enter Admin Console',
  },
  {
    role: 'Fleet Manager',
    path: '/fleet',
    icon: Wrench,
    badge: 'Hardware & QC',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: 'Fleet & Pre-Delivery QC Deck',
    desc: 'Register newly manufactured drone units, conduct mandatory 4-point technical diagnostics (dual avionics, battery impedance, NPNT), and issue Pre-Delivery Clearances.',
    cta: 'Access Fleet Desk',
  },
  {
    role: 'Dispatcher',
    path: '/dispatch',
    icon: LayoutDashboard,
    badge: 'Airspace & Transit',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    title: 'Corridor Dispatch Board',
    desc: 'Schedule and clear transit shipments, assign escort personnel, monitor live corridor telemetry, and broadcast real-time milestone checkpoints.',
    cta: 'Open Dispatcher Board',
  },
  {
    role: 'Client Receiving Officer',
    path: '/receiving',
    icon: Package,
    badge: 'Handover & Acceptance',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: 'Client Receiving Station',
    desc: 'Inspect incoming drone shipments upon arrival, verify DGCA serial tags, complete physical condition checklists, and sign digital acceptance challans.',
    cta: 'Open Receiving Portal',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Wrench,
    title: 'Assembly & Hardware Registry',
    desc: 'Aerospace engineers complete airframe fabrication, calibrate dual-avionics, and register unique drone serial numbers into the centralized hardware ledger.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    step: '02',
    icon: Shield,
    title: 'Fleet Pre-Delivery QC Clearance',
    desc: 'Fleet Manager conducts rigorous bench diagnostics: battery impedance, dual-redundant IMU sensors, DGCA NPNT firmware, and emergency parachute release.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    step: '03',
    icon: Navigation,
    title: 'Secured Corridor Dispatch',
    desc: 'Dispatcher provisions the authorized airspace corridor, links secure telemetry transponders, assigns technical escort teams, and activates transit tracking.',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    step: '04',
    icon: Package,
    title: 'Client Technical Acceptance',
    desc: 'Receiving Officer verifies packaging seals, audits serial tags, submits physical quality score (1-5 stars), and signs digital handover certificates.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

const SPECS = [
  ['Max Payload Capacity', '5.0 kg Heavy Winch Tether System'],
  ['Cruise Speed', '65 km/h Operational Speed'],
  ['Airframe Material', 'Toray Aerospace-Grade Carbon Fiber'],
  ['Avionics Architecture', 'Dual RTK-GPS + Triple Redundant IMU'],
  ['Operational Range', '25 km BVLOS Flight Corridor'],
  ['Obstacle Avoidance', '360° LiDAR + Optical AI Collision System'],
  ['Ingress Protection', 'IP55 All-Weather Operational Rating'],
  ['Regulatory Compliance', 'DGCA Type-Certified & NPNT Enabled'],
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [activeModel, setActiveModel] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveModel(m => (m + 1) % FLEET_MODELS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const go = (page: string, url: string) => {
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Internal Operations Gateway
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden flex items-center" style={{ background: 'linear-gradient(135deg, #06010f 0%, #0d0520 45%, #10062a 100%)' }}>
        {/* 3D Interactive Elevation Mesh */}
        <ElevationMeshBackground />

        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 w-full pt-10 pb-16 sm:pt-14 sm:pb-20 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

            {/* ── Left Column: Operations Banner ── */}
            <div className="space-y-6">
              {/* Internal Restricted Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border border-purple-400/30 bg-purple-500/10 text-purple-200">
                <Lock className="w-3.5 h-3.5 text-purple-300" />
                <span>Restricted Access · Authorized IndoWings Personnel Only</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-tight text-white">
                IndoWings Operations Gateway
                <span className="block mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #c084fc, #818cf8)' }}>
                  UAV Fleet Delivery &amp; Handover Hub
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                Centralized mission control platform managing factory assembly, multi-point QC clearance, secured air corridor transit, and technical handover to client receiving stations.
              </p>

              {/* Current Active Hardware Line */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-1">
                <span className="text-xs uppercase tracking-wider text-white/40 font-bold">Active Delivery Line:</span>
                <div className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-bold text-purple-200">
                  {FLEET_MODELS[activeModel]}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => go('login', '/login')}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-sm text-white shadow-xl shadow-purple-900/40 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
                >
                  <Lock className="w-4 h-4" />
                  <span>Personnel OTP Login</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => go('track', '/track')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-purple-300" />
                  <span>Track Drone Transit</span>
                </button>
              </div>

              {/* Security & Compliance Pills */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Admin-Provisioned Accounts Only
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Multi-Point Pre-Delivery QC
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Digital Handover Sign-off
                </span>
              </div>
            </div>

            {/* ── Right Column: Floating Cyber Mascot ── */}
            <div className="flex flex-col items-center justify-center">
              <InteractiveDrone onOrderClick={() => go('login', '/login')} />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OPERATIONAL ROLES & WORKSPACES
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-purple-800 mb-3 uppercase tracking-wider">
              <span>Operational Access</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Role Workspaces
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
              Select your assigned operational desk to log in via your pre-provisioned enterprise credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES_OVERVIEW.map(r => (
              <div
                key={r.role}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-purple-700 group-hover:border-purple-200 transition-colors">
                      <r.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{r.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => go('login', '/login')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-[#3b0080] hover:text-white border border-slate-200 hover:border-[#3b0080] transition-all"
                  >
                    <span>{r.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4-STAGE DELIVERY & HANDOVER PROTOCOL (SOP)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#f9f7fd]" id="protocol">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-3">
              Standard Operating Procedure
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Factory-to-Base Handover Protocol
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
              Every IndoWings enterprise drone unit follows a strict four-stage chain of custody from assembly to physical client acceptance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 right-[-14px] z-10 text-slate-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${step.color}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{step.step}</span>
                <h3 className="text-sm font-black text-slate-900 mt-1 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HARDWARE FLEET SPECIFICATIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Description */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-2">Hardware Registry</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                  Industrial-Grade UAV Hardware Specifications
                </h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                All delivered units undergo component-level certification. Telemetry hardware, dual avionics, and failsafe parachute deployment are calibrated prior to issuing transport dispatch clearance.
              </p>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#3b0080]" />
                  QC Certification Compliance
                </p>
                <p className="text-purple-800 leading-relaxed">
                  Only drones verified with zero critical faults and signed off by the certified Fleet Manager are permitted to transition into the Dispatch stage.
                </p>
              </div>
              <div>
                <button
                  onClick={() => go('login', '/login')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#3b0080] hover:bg-[#2e0066] transition-all shadow-md active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Access Fleet Data</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>

            {/* Right Specs Table Card */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 text-white">
              <div className="p-6 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Cyberone Max Industrial UAV</h3>
                  <p className="text-xs text-white/50 mt-0.5">Heavy Lift Hardware Spec · DGCA Type-Certified</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STANDARD UNIT
                </span>
              </div>
              <div className="p-6 divide-y divide-white/10 text-xs">
                {SPECS.map(([label, value]) => (
                  <div key={label} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <span className="text-white/50">{label}</span>
                    <span className="font-bold text-white text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INTERNAL SECURITY & ACCESS NOTICE
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-900 text-white text-center">
        <div className="max-w-[800px] mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-slate-300">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>IndoWings Proprietary Enterprise System</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">Authorized Operations Access</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            This platform contains confidential hardware telemetry, corridor dispatch records, and defense station handover logs. Unauthorized access attempts are monitored and logged.
          </p>
          <div className="pt-2">
            <button
              onClick={() => go('login', '/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#3b0080]" />
              <span>Enter Personnel Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
