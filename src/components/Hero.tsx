import React, { useState, useEffect, useRef } from 'react';
import { Package, Navigation, ArrowRight, CheckCircle2, MapPin, Zap, Shield, Clock, Star, ChevronRight, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { ScrollDroneFlight } from './ScrollDroneFlight';
import { ElevationMeshBackground } from './ElevationMeshBackground';

interface HeroProps {
  onOpenCommandCenter: () => void;
  onOpenDemoBooking: () => void;
  onNavigate?: (page: string) => void;
}

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '24', unit: 'min', label: 'Avg. Delivery Time' },
  { value: '65', unit: 'km/h', label: 'Cruise Speed' },
  { value: '5.0', unit: 'kg', label: 'Max Payload' },
  { value: '99.2', unit: '%', label: 'On-Time Rate' },
];

const PACKAGE_TYPES = [
  { name: 'Medicine & Lab Samples' },
  { name: 'Documents & Contracts' },
  { name: 'Food & Hot Parcels' },
  { name: 'Electronics & Spares' },
  { name: 'Lab & Medical Kits' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: MapPin, title: 'Book Your Delivery', desc: 'Enter pickup & drop address in Delhi-NCR. Choose package type, weight & schedule instantly.', color: 'bg-black text-white', border: 'border-zinc-200' },
  { step: '02', icon: Zap, title: 'Instant UAV Dispatch', desc: 'Nearest Cyberone drone is assigned. Autonomous pre-flight safety check completes in 90 seconds.', color: 'bg-zinc-800 text-white', border: 'border-zinc-200' },
  { step: '03', icon: Navigation, title: 'Real-Time Tracking', desc: 'Track live flight on your screen. SMS alert sent 3 minutes before the drone reaches your drop zone.', color: 'bg-zinc-700 text-white', border: 'border-zinc-200' },
  { step: '04', icon: Package, title: 'Contactless Delivery', desc: 'Drone hovers at 12m, winches package to ground. Digital receipt sent immediately upon delivery.', color: 'bg-black text-white', border: 'border-zinc-200' },
];

const FEATURES = [
  { icon: Clock, title: 'Under 24 Minutes', desc: 'Faster than any road vehicle across all Delhi-NCR air corridors.' },
  { icon: Shield, title: 'DGCA Certified', desc: 'Fully compliant under India Drone Rules 2021 — licensed BVLOS operations.' },
  { icon: Navigation, title: 'Live Telemetry', desc: 'GPS tracking with weather sensor, LiDAR obstacle avoidance & auto-hold.' },
  { icon: Zap, title: 'COD + Online Pay', desc: 'Razorpay UPI, Debit/Credit Cards, or Cash on Delivery — any preference.' },
];

const COVERAGE_ZONES = [
  { zone: 'Noida Sector 62', type: 'UAV Primary Hub' },
  { zone: 'Connaught Place', type: 'Central Drop Zone' },
  { zone: 'AIIMS New Delhi', type: 'Medical Priority Port' },
  { zone: 'Cyber City Gurugram', type: 'Tech Corridor Hub' },
  { zone: 'Dwarka Sector 21', type: 'Residential Hub' },
  { zone: 'Greater Noida', type: 'Express Zone' },
];

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [activePkg, setActivePkg] = useState(0);
  const [liveCount, setLiveCount] = useState(12);
  const [statsCounted, setStatsCounted] = useState(false);
  const [displayStats, setDisplayStats] = useState(STATS.map(() => 0));
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);

  // Cycle packages
  useEffect(() => {
    const t = setInterval(() => setActivePkg(p => (p + 1) % PACKAGE_TYPES.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Random live drone count
  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => Math.max(8, Math.min(20, n + (Math.random() > 0.5 ? 1 : -1)))), 6000);
    return () => clearInterval(t);
  }, []);

  const [analytics, setAnalytics] = useState<any>(null);
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [liveOrder, setLiveOrder] = useState<any>(null); // real in-flight order

  // Fetch real analytics + latest order + live in-flight order from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/delivery/analytics`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAnalytics(data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/delivery/orders`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.orders?.length) {
          const orders = data.orders;

          // Live flight: most recent in-flight/taking-off/approaching order
          const inFlight = orders
            .filter((o: any) => ['in-flight', 'taking-off', 'approaching'].includes(o.status))
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (inFlight.length > 0) setLiveOrder(inFlight[0]);

          // Latest delivered order
          const delivered = orders
            .filter((o: any) => o.status === 'delivered')
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (delivered.length > 0) setLatestOrder(delivered[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real feedback from backend (Strictly latest 3 sorted by date)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/delivery/feedbacks`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.feedbacks && Array.isArray(data.feedbacks)) {
          // Sort strictly newest first by date
          const sorted = [...data.feedbacks].sort((a: any, b: any) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          });
          const good = sorted.filter((f: any) => f.rating >= 4 && f.message?.trim());
          setReviews(good.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, []);

  // Count-up stats
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !statsCounted) {
        setStatsCounted(true);
        STATS.forEach((stat, i) => {
          const target = parseFloat(stat.value);
          const duration = 1200;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setDisplayStats(prev => { const n = [...prev]; n[i] = current; return n; });
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        });
      }
    }, { threshold: 0.5 });
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsCounted]);

  const formatStat = (val: number, orig: string) => {
    if (orig.includes('.')) return val.toFixed(1);
    return Math.round(val).toString();
  };

  const go = (page: string, url: string) => {
    onNavigate?.(page);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      {/* 3D Global UAV Flight Coordinator between Hero and Features */}
      <ScrollDroneFlight heroSlotId="hero-drone-slot" featuresSlotId="features-drone-slot" />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden flex items-center min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] py-10 lg:py-0" style={{ background: 'linear-gradient(135deg, #000000 0%, #09090b 50%, #121214 100%)' }}>

        {/* 3D Interactive Elevation Mesh that reacts to cursor position */}
        <ElevationMeshBackground />

        {/* Monochrome Radial glow */}
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 w-full py-8 lg:py-12 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&_input]:pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 items-center">

            {/* ── Left ── */}
            <div className="space-y-6 sm:space-y-8">
              {/* Live badge — only shown when real deliveries exist */}
              {analytics && analytics.deliveredOrders > 0 && (
                <div className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#ffffff' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{analytics.deliveredOrders} deliveries completed · {analytics.inFlightOrders || 0} flights active</span>
                </div>
              )}

              {/* Eyebrow */}
              <p className="text-[11px] sm:text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
                India&apos;s Autonomous Drone Delivery Network
              </p>

              {/* Headline */}
              <h1 className="text-[32px] sm:text-[48px] lg:text-[62px] font-black leading-[1.08] tracking-tight text-white">
                Deliver Anything,{' '}
                <span className="relative">
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #ffffff, #d4d4d8, #a1a1aa)' }}>
                    Anywhere in NCR
                  </span>
                </span>
                <br />
                <span className="text-white/80 text-[24px] sm:text-[38px] lg:text-[52px]">— Under 24 Minutes.</span>
              </h1>

              {/* Body */}
              <p className="text-sm sm:text-lg text-white/60 max-w-lg leading-relaxed">
                IndoWings Cyberone autonomous UAVs fly at 65 km/h above Delhi-NCR traffic — delivering medicine, documents, food and parcels to your rooftop via precision Kevlar winch tether. Contactless. Certified. Instant.
              </p>


              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => go('order', '/order')}
                  className="group flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-black text-sm text-black bg-white hover:bg-zinc-200 shadow-xl shadow-white/10 transition-all active:scale-95 w-full sm:w-auto"
                >
                  <span>Book Drone Delivery</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => go('track', '/track')}
                  className="flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Navigation className="w-4 h-4 text-zinc-300" />
                  <span>Track My Order</span>
                </button>
              </div>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 pt-2 text-[11px] sm:text-xs text-white/50">
                {['DGCA Certified UAVs', 'Razorpay Secured', 'Live SMS Tracking', 'COD Available'].map(b => (
                  <span key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right Column: Mobile shows original floating character girl, Laptop shows 3D UAV slot ── */}
            <div className="flex flex-col items-center justify-center pt-2 lg:pt-0">
              {/* Mobile Only: Original Floating Character Girl */}
              <div className="block lg:hidden relative w-full max-w-[320px] flex flex-col items-center justify-center select-none py-3">
                <div className="absolute inset-0 bg-white/10 blur-[50px] rounded-full scale-90 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <img
                    src="/images/floating-character.png"
                    alt="IndoWings UAV Operator"
                    loading="eager"
                    className="relative z-10 w-full max-w-[230px] sm:max-w-[280px] h-auto object-contain pointer-events-none"
                    style={{ animation: "floatGlow 3.5s ease-in-out infinite" }}
                  />
                  <div
                    className="w-36 sm:w-44 h-4 rounded-[100%] bg-white/20 blur-[10px] -mt-3 pointer-events-none"
                    style={{ animation: "shadowPulse 3.5s ease-in-out infinite" }}
                  />
                </div>
              </div>

              {/* Laptop Only: Hero Drone Slot for 3D UAV Flight */}
              <div
                id="hero-drone-slot"
                className="hidden lg:flex relative w-full max-w-[500px] min-h-[320px] sm:min-h-[380px] lg:min-h-[450px] flex-col items-center justify-center select-none pt-2 lg:pt-0"
              >
                {/* Soft ambient glow behind Hero Drone */}
                <div className="absolute inset-0 bg-white/[0.04] blur-[80px] rounded-full scale-95 pointer-events-none" />
                <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] bg-white/[0.02] blur-[60px] rounded-full pointer-events-none" />

                {/* Orbital rings */}
                <div className="absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[410px] lg:h-[410px] rounded-full border border-white/[0.08] border-dashed animate-[spin_120s_linear_infinite] pointer-events-none" />
                <div className="absolute w-[210px] h-[210px] sm:w-[270px] sm:h-[270px] lg:w-[320px] lg:h-[320px] rounded-full border border-white/[0.05] pointer-events-none" />

                {/* Soft ground shadow */}
                <div className="absolute bottom-4 sm:bottom-6 w-48 sm:w-60 h-4 sm:h-5 rounded-[100%] bg-black/60 blur-[12px] sm:blur-[14px] pointer-events-none" />
              </div>
            </div>

            <style>{`
              @keyframes floatGlow {
                0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.35)); }
                50% { transform: translateY(-16px); filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.6)); }
              }
              @keyframes shadowPulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(0.75); opacity: 0.2; }
              }
            `}</style>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS BAR — Count-up animation
         ══════════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ background: 'linear-gradient(90deg, #050507 0%, #111116 50%, #050507 100%)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 md:gap-0 md:divide-x divide-white/10">
            {STATS.map((s, i) => (
              <div key={s.label} className="text-center py-1 sm:py-2 px-2 sm:px-4">
                <p className="text-2xl sm:text-3xl lg:text-[44px] font-black text-white tabular-nums leading-none tracking-tight">
                  {formatStat(displayStats[i], s.value)}
                  <span className="text-base sm:text-lg lg:text-2xl font-bold text-zinc-400 ml-1">{s.unit}</span>
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 mt-1.5 sm:mt-2 tracking-wide uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS — Dynamic Aerospace Flight Path Deck
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden" id="how-it-works" style={{ background: 'linear-gradient(180deg, #09090b 0%, #0d0d12 100%)' }}>
        {/* Subtle dot matrix & ambient spotlight */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Autonomous Flight Protocol</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Booking to doorstep delivery
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-white via-zinc-400 to-transparent mx-auto mt-5" />
            <p className="text-zinc-400 mt-6 text-base max-w-xl mx-auto leading-relaxed">
              Our fully autonomous system handles everything — from the moment you book to the contactless tether drop at your rooftop. Zero human intervention required mid-flight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step}
                className="relative bg-[#131318]/90 backdrop-blur-md rounded-3xl p-7 border border-white/10 shadow-xl hover:border-white/30 hover:bg-[#181820] hover:-translate-y-2 transition-all duration-300 group">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:flex absolute top-12 right-[-18px] z-10 text-zinc-600">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white text-black font-bold transition-transform group-hover:scale-110 shadow-lg shadow-white/10">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-500 tracking-[0.2em] uppercase">{step.step}</span>
                <h3 className="text-lg font-black text-white mt-1 mb-2.5 leading-tight">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES — Split layout with Radar & Telemetry Backdrops
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden border-t border-b border-white/[0.06]" id="features" style={{ background: 'linear-gradient(180deg, #0d0d12 0%, #060608 100%)' }}>
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-7">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Enterprise UAV Engineering</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Built for speed, safety and Indian skies.
                </h2>
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-white via-zinc-500 to-transparent mt-5" />
              </div>
              <p className="text-zinc-400 text-base leading-relaxed">
                Our Cyberone Pro UAVs are purpose-engineered for last-mile urban delivery in dense Indian metros — overcoming the traffic, weather and building density that paralyses ground vehicles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map(f => (
                  <div key={f.title} className="group flex items-start gap-4 p-5 bg-[#141419]/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] hover:border-white/25 hover:bg-[#1a1a22] transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 group-hover:bg-white group-hover:text-black text-white flex items-center justify-center shrink-0 transition-all shadow-sm">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{f.title}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => go('order', '/order')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm text-black bg-white hover:bg-zinc-200 shadow-xl shadow-white/10 transition-all active:scale-95"
              >
                <Package className="w-4 h-4" />
                Book Your First Delivery
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Only: Classic Drone Spec Card */}
            <div className="block lg:hidden rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <div className="px-6 sm:px-7 py-6" style={{ background: 'linear-gradient(135deg, #000000, #141418)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/15">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">Cyberone Pro UAV</h3>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">IndoWings Fleet · v3.4.4 Stable</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                    ● ACTIVE
                  </span>
                </div>
                {[
                  ['Max Payload', '5.0 kg'],
                  ['Cruise Speed', '65 km/h'],
                  ['Altitude', '90 m AGL'],
                  ['Range', '25 km'],
                  ['Winch System', 'Kevlar Tether Drop'],
                  ['Obstacle Avoidance', 'LiDAR + Vision AI'],
                  ['Weather Rating', 'IP55 · Wind ≤35 km/h'],
                  ['Certification', 'DGCA BVLOS Class'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2.5 sm:py-3 border-b border-white/[0.06] last:border-0">
                    <span className="text-xs font-semibold text-zinc-400">{label}</span>
                    <span className="text-sm font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-5 bg-[#09090b]">
                <button onClick={() => go('order', '/order')}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-black bg-white hover:bg-zinc-200 shadow-lg transition-all active:scale-95"
                >
                  Book Now — Instant Dispatch ↗
                </button>
              </div>
            </div>

            {/* Laptop Only: Clean Floating Drone Slot (Target for Scroll Flight) */}
            <div
              id="features-drone-slot"
              className="hidden lg:flex relative w-full max-w-[500px] min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] flex-col items-center justify-center select-none py-4 mx-auto"
            >
              {/* Soft ambient glow behind Drone */}
              <div className="absolute inset-0 bg-white/[0.03] blur-[95px] sm:blur-[120px] rounded-full scale-95 pointer-events-none" />
              <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] bg-white/[0.015] blur-[75px] sm:blur-[105px] rounded-full pointer-events-none" />

              {/* Concentric radar rings */}
              <div className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] rounded-full border border-white/[0.08] border-dashed animate-[spin_120s_linear_infinite] pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] rounded-full border border-white/[0.05] pointer-events-none" />
              <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full border border-white/[0.03] pointer-events-none" />

              {/* Soft ground shadow */}
              <div className="absolute bottom-6 sm:bottom-10 w-52 sm:w-64 h-4.5 sm:h-5.5 rounded-[100%] bg-black/80 blur-[14px] sm:blur-[18px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COVERAGE ZONES — Aerospace Air Corridors
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #060608 0%, #0d0d12 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Certified Airspace</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">Delhi-NCR Air Corridors</h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-white via-zinc-400 to-transparent mx-auto mt-5" />
            <p className="text-zinc-400 text-base max-w-md mx-auto mt-5 leading-relaxed">
              Pre-certified autonomous flight corridors across Delhi, Noida, Gurugram and Greater Noida.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COVERAGE_ZONES.map(z => (
              <div key={z.zone} className="bg-[#131318]/90 backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08] shadow-lg text-center hover:border-white/30 hover:bg-[#1a1a22] hover:-translate-y-1 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] text-white group-hover:bg-white group-hover:text-black flex items-center justify-center mx-auto mb-3 transition-colors shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-white leading-snug">{z.zone}</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 leading-tight">{z.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          REAL CUSTOMER REVIEWS
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden border-t border-white/[0.06]" style={{ background: 'linear-gradient(180deg, #0d0d12 0%, #000000 100%)' }}>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Enterprise Feedback</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">What our customers say</h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-white via-zinc-400 to-transparent mx-auto mt-5" />
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {reviews.map((t, i) => (
                  <div key={t.id || i} className="bg-[#121217]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-white/10 hover:border-white/25 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= (t.rating || 5) ? 'fill-white text-white' : 'text-zinc-700 fill-zinc-700'}`} />
                        ))}
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed font-medium">"{t.message}"</p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black bg-white text-sm font-black shrink-0 shadow-sm">
                        {(t.user_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{t.user_name || 'IndoWings Customer'}</p>
                        <p className="text-xs text-zinc-400">{t.drone_name ? `Delivered via ${t.drone_name}` : 'Verified Customer'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button onClick={() => go('feedback', '/feedback')}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:gap-3">
                  <span>View All Customer Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-sm">No reviews yet — be the first to share your experience!</p>
              <button onClick={() => go('order', '/order')}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black bg-white hover:bg-zinc-200 transition-all"
              >
                <Package className="w-4 h-4" />
                Book Your First Delivery
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #09090b 50%, #121214 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#ffffff' }}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Live fleet operational · Delhi-NCR · {liveCount} drones active
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
            Ready to experience the future of delivery?
          </h2>
          <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed">
            Join thousands of Delhi-NCR residents using IndoWings for same-day medicine, document and parcel delivery — in under 24 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button onClick={() => go('order', '/order')}
              className="group flex items-center gap-2.5 px-9 py-4 rounded-xl font-black text-sm text-black bg-white hover:bg-zinc-200 shadow-2xl transition-all active:scale-95">
              <Package className="w-5 h-5" />
              Book Drone Delivery Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => go('track', '/track')}
              className="flex items-center gap-2.5 px-9 py-4 rounded-xl font-bold text-sm text-white border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all active:scale-95">
              <Navigation className="w-4 h-4" />
              Track Existing Order
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
