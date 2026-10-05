import React, { useState } from 'react';
import {
  Package,
  Navigation,
  ArrowRight,
  Shield,
  Lock,
  Wrench,
  LayoutDashboard,
  ChevronRight,
  Radio,
  Activity,
  Cpu,
  Zap,
  Crosshair,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { InteractiveDrone } from './InteractiveDrone';
import { ElevationMeshBackground } from './ElevationMeshBackground';

interface HeroProps {
  onOpenCommandCenter?: () => void;
  onOpenDemoBooking?: () => void;
  onNavigate?: (page: string) => void;
}

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

const FLEET_INSPECTOR_MODELS = [
  {
    id: 'cyberone',
    name: 'Cyberone Max',
    tagline: 'Heavy Cargo UAV with Winch Tether',
    tag: 'Heavy Winch',
    color: '#a855f7',
    badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    payload: '5.0 kg',
    payloadPct: 90,
    speed: '65 km/h',
    speedPct: 70,
    range: '25 km BVLOS',
    rangePct: 60,
    endurance: '45 min',
    batteryHealth: '99.4%',
    avionics: 'Dual RTK-GPS + Redundant IMU',
    parachute: 'Pyro-Release Active',
    activeWaypoint: 'WP-04 · Noida Air Corridor',
    radarPoints: [
      { x: 30, y: 35, label: 'Assembly Hub' },
      { x: 60, y: 65, label: 'Corridor Transit' },
      { x: 82, y: 40, label: 'Destination Base' },
    ],
  },
  {
    id: 'indohawk',
    name: 'IndoHawk Alpha',
    tagline: 'High-Altitude Tactical Recon UAV',
    tag: 'Tactical Recon',
    color: '#38bdf8',
    badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    payload: '3.2 kg',
    payloadPct: 65,
    speed: '85 km/h',
    speedPct: 88,
    range: '40 km BVLOS',
    rangePct: 80,
    endurance: '75 min',
    batteryHealth: '98.8%',
    avionics: 'Encrypted Datalink + Optical EO/IR',
    parachute: 'Dual Redundant Air-Chute',
    activeWaypoint: 'WP-12 · High Altitude Grid',
    radarPoints: [
      { x: 25, y: 45, label: 'North Airbase' },
      { x: 55, y: 30, label: 'Surveillance Sector' },
      { x: 75, y: 70, label: 'Forward Outpost' },
    ],
  },
  {
    id: 'stealthpro',
    name: 'StealthPro VTOL',
    tagline: 'Long-Range Fixed-Wing Hybrid UAV',
    tag: 'Fixed-Wing VTOL',
    color: '#10b981',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    payload: '4.0 kg',
    payloadPct: 75,
    speed: '110 km/h',
    speedPct: 98,
    range: '120 km BVLOS',
    rangePct: 95,
    endurance: '150 min',
    batteryHealth: '99.9%',
    avionics: 'Hybrid Transition Quad-to-Wing',
    parachute: 'Autopilot Emergency Safe-Land',
    activeWaypoint: 'WP-28 · Regional Intercity Airway',
    radarPoints: [
      { x: 18, y: 70, label: 'Plant Depot' },
      { x: 50, y: 40, label: 'Transit Altitude 400m' },
      { x: 86, y: 25, label: 'Regional Base Station' },
    ],
  },
  {
    id: 'agriwing',
    name: 'AgriWing X',
    tagline: 'Precision Industrial Agro & Spray UAV',
    tag: 'Agro Industrial',
    color: '#f59e0b',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    payload: '10.0 L',
    payloadPct: 95,
    speed: '45 km/h',
    speedPct: 50,
    range: '15 km Sub-Corridor',
    rangePct: 45,
    endurance: '35 min',
    batteryHealth: '98.2%',
    avionics: 'Centimeter RTK Swath Guidance',
    parachute: 'Terrain-Follow Collision Radar',
    activeWaypoint: 'WP-02 · Agro Testing Range',
    radarPoints: [
      { x: 35, y: 60, label: 'Logistics Port' },
      { x: 65, y: 50, label: 'Faridabad Range' },
      { x: 78, y: 80, label: 'Agronomy Depot' },
    ],
  },
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [selectedDrone, setSelectedDrone] = useState(0);
  const [activeHudTab, setActiveHudTab] = useState<'radar' | 'telemetry' | 'avionics'>('radar');
  const [simulating, setSimulating] = useState(false);

  const drone = FLEET_INSPECTOR_MODELS[selectedDrone];

  const go = (page: string, url: string) => {
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 2400);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Clean Operations Gateway
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          background: 'linear-gradient(135deg, #06010f 0%, #0d0520 45%, #10062a 100%)',
        }}
      >
        {/* 3D Interactive Elevation Mesh */}
        <ElevationMeshBackground />

        {/* Ambient atmospheric glows */}
        <div
          className="absolute top-1/4 left-1/3 w-[650px] h-[650px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 w-full pt-10 pb-16 sm:pt-14 sm:pb-20 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">
            {/* ── Left Column: Operations Banner ── */}
            <div className="space-y-6">
              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-tight text-white">
                IndoWings Operations Gateway
                <span
                  className="block mt-2 text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #c084fc, #818cf8)',
                  }}
                >
                  UAV Fleet Delivery &amp; Handover Hub
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                Centralized mission control platform managing factory assembly, multi-point QC clearance, secured air corridor transit, and technical handover to client receiving stations.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => go('login', '/login')}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-sm text-white shadow-xl shadow-purple-900/40 transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  }}
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Role Workspaces
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
              Select your assigned operational desk to log in via your pre-provisioned enterprise credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES_OVERVIEW.map((r) => (
              <div
                key={r.role}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-purple-700 group-hover:border-purple-200 transition-colors">
                      <r.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${r.badgeColor}`}
                    >
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
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {step.step}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INTERACTIVE FLEET COMMAND HUD & RADAR MATRIX (REPLACED STATIC SPECS)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0a0518] text-white border-t border-purple-900/30 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
                <Crosshair className="w-4 h-4 text-purple-400" />
                <span>Interactive Fleet Inspector</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Live UAV Telemetry &amp; Flight Matrix
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1.5 max-w-xl">
                Real-time avionics, radar waypoint tracking, and multi-point hardware clearance metrics.
              </p>
            </div>

            {/* Model Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {FLEET_INSPECTOR_MODELS.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedDrone(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    selectedDrone === idx
                      ? 'bg-purple-600/30 text-white border-purple-500 shadow-lg shadow-purple-900/40'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: Interactive Radar & Flight Path Display (7 cols) */}
            <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
              {/* Radar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{drone.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${drone.badgeStyle}`}>
                        {drone.tag}
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/40">{drone.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveHudTab('radar')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeHudTab === 'radar' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Radar
                  </button>
                  <button
                    onClick={() => setActiveHudTab('telemetry')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeHudTab === 'telemetry' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Sensors
                  </button>
                  <button
                    onClick={() => setActiveHudTab('avionics')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeHudTab === 'avionics' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Diagnostics
                  </button>
                </div>
              </div>

              {/* Main Interactive Screen Content */}
              <div className="my-6 min-h-[260px] flex items-center justify-center relative">
                {activeHudTab === 'radar' && (
                  <div className="relative w-full max-w-[340px] aspect-square rounded-full border border-purple-500/20 flex items-center justify-center bg-black/40 overflow-hidden shadow-inner">
                    {/* Concentric radar rings */}
                    <div className="absolute w-[75%] aspect-square rounded-full border border-purple-500/20" />
                    <div className="absolute w-[50%] aspect-square rounded-full border border-purple-500/20" />
                    <div className="absolute w-[25%] aspect-square rounded-full border border-purple-500/20" />
                    {/* Crosshair lines */}
                    <div className="absolute w-full h-[1px] bg-purple-500/20" />
                    <div className="absolute h-full w-[1px] bg-purple-500/20" />

                    {/* Rotating Radar Sweep Line */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background:
                          'conic-gradient(from 0deg, rgba(168,85,247,0.3) 0deg, rgba(168,85,247,0) 60deg, transparent 360deg)',
                        animation: 'spin 4s linear infinite',
                      }}
                    />

                    {/* Radar Waypoints */}
                    {drone.radarPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="absolute group/pt cursor-pointer transition-transform hover:scale-125"
                        style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      >
                        <div
                          className="w-3 h-3 rounded-full animate-ping absolute opacity-75"
                          style={{ backgroundColor: drone.color }}
                        />
                        <div
                          className="w-3 h-3 rounded-full relative shadow-md"
                          style={{ backgroundColor: drone.color }}
                        />
                        <div className="hidden group-hover/pt:block absolute left-4 top-[-8px] whitespace-nowrap bg-black/90 border border-purple-500/40 text-[10px] font-bold text-purple-200 px-2 py-0.5 rounded shadow-lg z-20">
                          {pt.label}
                        </div>
                      </div>
                    ))}

                    {/* Center Drone Marker */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-white/10 border border-white/40 flex items-center justify-center">
                      <Navigation
                        className={`w-3.5 h-3.5 transition-transform duration-500 ${
                          simulating ? 'rotate-90 scale-125 text-emerald-400' : 'text-purple-300'
                        }`}
                      />
                    </div>

                    <div className="absolute bottom-2 left-4 text-[10px] font-mono text-purple-400/70">
                      SYS: {drone.activeWaypoint}
                    </div>
                  </div>
                )}

                {activeHudTab === 'telemetry' && (
                  <div className="w-full grid grid-cols-2 gap-3 p-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <p className="text-white/40 text-[10px]">AVIONICS ARCHITECTURE</p>
                      <p className="font-bold text-purple-300 mt-1">{drone.avionics}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <p className="text-white/40 text-[10px]">BATTERY CELL IMPEDANCE</p>
                      <p className="font-bold text-emerald-400 mt-1">{drone.batteryHealth} Optimal</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <p className="text-white/40 text-[10px]">FAIL-SAFE EMERGENCY</p>
                      <p className="font-bold text-sky-300 mt-1">{drone.parachute}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <p className="text-white/40 text-[10px]">CURRENT CORRIDOR</p>
                      <p className="font-bold text-amber-300 mt-1">{drone.activeWaypoint}</p>
                    </div>
                  </div>
                )}

                {activeHudTab === 'avionics' && (
                  <div className="w-full p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-emerald-500/20">
                      <span className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Dual RTK Satellite Lock
                      </span>
                      <span className="text-emerald-400 font-bold">28 SATS (FIX 3D)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-emerald-500/20">
                      <span className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        DGCA NPNT Cryptographic Signature
                      </span>
                      <span className="text-emerald-400 font-bold">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-emerald-500/20">
                      <span className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Motor Thrust &amp; ESC Redundancy
                      </span>
                      <span className="text-emerald-400 font-bold">CALIBRATED</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Telemetry Link: 5.8 GHz Datalink Online</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{simulating ? 'Simulating Transit...' : 'Simulate Transit Corridor'}</span>
                  </button>
                  <button
                    onClick={() => go('track', '/track')}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Performance Meters (5 cols) */}
            <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white/90">
                    Performance Telemetry
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-purple-300">
                    Live Diagnostics
                  </span>
                </div>

                {/* Progress Meters */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">Max Cruise Speed</span>
                      <span className="font-mono font-bold text-white">{drone.speed}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${drone.speedPct}%`,
                          backgroundColor: drone.color,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">Operational BVLOS Range</span>
                      <span className="font-mono font-bold text-white">{drone.range}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${drone.rangePct}%`,
                          backgroundColor: drone.color,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">Payload Capability</span>
                      <span className="font-mono font-bold text-white">{drone.payload}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${drone.payloadPct}%`,
                          backgroundColor: drone.color,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">Mission Flight Endurance</span>
                      <span className="font-mono font-bold text-white">{drone.endurance}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hardware Spec Quick Cards */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40">AIRFRAME</p>
                    <p className="font-bold text-white mt-0.5">Toray Carbon Fiber</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40">INGRESS RATING</p>
                    <p className="font-bold text-white mt-0.5">IP55 All-Weather</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40">AVIONICS</p>
                    <p className="font-bold text-white mt-0.5 truncate">Triple Redundant</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40">REGULATORY</p>
                    <p className="font-bold text-emerald-400 mt-0.5">DGCA Certified</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => go('login', '/login')}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  }}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Access Fleet Command Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
