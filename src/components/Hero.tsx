import React, { useState, useEffect } from 'react';
import { DownloadCloud, Package, MapPin, Zap, Shield, Clock, Truck, ChevronRight, Star, CheckCircle2, Navigation, Radio, ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onOpenCommandCenter: () => void;
  onOpenDemoBooking: () => void;
  onNavigate?: (page: string) => void;
}

const STATS = [
  { value: '24', unit: 'min', label: 'Avg. Delivery Time' },
  { value: '65', unit: 'km/h', label: 'Drone Cruise Speed' },
  { value: '5', unit: 'kg', label: 'Max Payload' },
  { value: '99.2', unit: '%', label: 'On-Time Rate' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: MapPin,
    title: 'Book Your Delivery',
    desc: 'Enter pickup & drop address anywhere in Delhi-NCR. Choose package type, weight and schedule.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Instant Dispatch',
    desc: 'Our Command Center assigns the nearest Cyberone UAV. Autonomous pre-flight check completes in 90 seconds.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    step: '03',
    icon: Navigation,
    title: 'Live Flight Tracking',
    desc: 'Track your drone in real-time. Get SMS alerts when the UAV is 3 minutes away from your drop zone.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    step: '04',
    icon: Package,
    title: 'Contactless Delivery',
    desc: 'Drone hovers at 12m altitude, winches package down softly. Instant digital delivery receipt sent to you.',
    color: 'bg-amber-100 text-amber-700',
  },
];

const FEATURES = [
  { icon: Clock, title: 'Under 24 Minutes', desc: 'Faster than any road delivery across Delhi-NCR corridors' },
  { icon: Shield, title: 'DGCA Certified', desc: 'All drones licensed under Drone Rules 2021 — fully compliant' },
  { icon: Radio, title: 'Real-Time Telemetry', desc: 'Live GPS tracking with automated weather & obstacle detection' },
  { icon: Truck, title: 'COD + Online Pay', desc: 'Pay with Razorpay UPI, Cards or Cash on Delivery — your choice' },
];

const PACKAGE_TYPES = [
  { emoji: '💊', name: 'Medicine', badge: 'Priority' },
  { emoji: '📄', name: 'Documents', badge: 'Express' },
  { emoji: '🍱', name: 'Food Parcel', badge: 'Hot Pack' },
  { emoji: '📱', name: 'Electronics', badge: 'Secure' },
  { emoji: '🧪', name: 'Lab Samples', badge: 'Medical' },
  { emoji: '📦', name: 'Personal Items', badge: 'Standard' },
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [activePkg, setActivePkg] = useState(0);
  const [liveCount, setLiveCount] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => n + Math.floor(Math.random() * 2)), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActivePkg(p => (p + 1) % PACKAGE_TYPES.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d0520] text-white min-h-[92vh] flex items-center">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(192,132,252,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[100px] pointer-events-none" />

        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 w-full py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT: Copy */}
            <div className="space-y-7">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {liveCount} drones active in Delhi-NCR right now
              </div>

              {/* Eyebrow */}
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-purple-400">
                India's First Autonomous Drone Delivery Network
              </p>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold leading-[1.06] tracking-tight">
                Deliver Anything,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Anywhere in NCR
                </span>{' '}
                — Under 24 Minutes.
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
                IndoWings autonomous UAV drones fly above Delhi-NCR traffic at 65 km/h, delivering medicine, documents, food & parcels straight to your rooftop — contactless, safe, and DGCA-certified.
              </p>

              {/* Package type ticker */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50 font-medium">Delivering:</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 transition-all duration-500">
                  <span className="text-xl">{PACKAGE_TYPES[activePkg].emoji}</span>
                  <span className="text-sm font-bold text-white">{PACKAGE_TYPES[activePkg].name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">
                    {PACKAGE_TYPES[activePkg].badge}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate?.('order')}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                >
                  <Package className="w-4 h-4" />
                  Book Drone Delivery
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate?.('track')}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  Track My Order
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {['DGCA Certified', 'Razorpay Secured', 'SMS Tracking', 'COD Available'].map(b => (
                  <span key={b} className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Live Order Card Mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="w-full max-w-[400px] space-y-4">
                {/* Live Drone Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white text-lg">🚁</div>
                      <div>
                        <p className="text-xs font-bold text-white">Cyberone Pro · IW-247</p>
                        <p className="text-[10px] text-white/50">Active flight · 65 km/h</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/20">
                      ✈️ In Flight
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                      <span>📍 Sector 62 Hub, Noida</span>
                      <span>🏠 Drop Zone</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1 text-right">ETA: ~6 mins</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-base font-black text-white">3.2</p>
                      <p className="text-[9px] text-white/40">km left</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-base font-black text-white">90m</p>
                      <p className="text-[9px] text-white/40">altitude</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-base font-black text-white">💊</p>
                      <p className="text-[9px] text-white/40">Medicine</p>
                    </div>
                  </div>
                </div>

                {/* Order ID card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 font-semibold">ORDER ID</p>
                    <p className="text-sm font-black text-white font-mono tracking-wider">INW2026042</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 font-semibold">PAYMENT</p>
                    <p className="text-sm font-bold text-emerald-400">✓ Paid · ₹149</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-white/60 font-medium">"Delivered in 19 mins. Incredible!" — Rahul, Noida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section className="bg-[#3b0080] text-white py-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/10">
            {STATS.map(s => (
              <div key={s.label} className="text-center px-4">
                <p className="text-3xl sm:text-4xl font-extrabold text-white">
                  {s.value}<span className="text-lg font-bold text-purple-300 ml-1">{s.unit}</span>
                </p>
                <p className="text-xs font-semibold text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8f6fc]" id="how-it-works">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171222] tracking-tight">
              Order to doorstep — in 4 steps
            </h2>
            <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
              Our fully autonomous system handles everything from booking to contactless tether drop — no human intervention required mid-flight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Connector line (desktop) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-[52px] right-[-24px] w-6 text-slate-300 z-10">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{step.step}</span>
                <h3 className="text-lg font-extrabold text-[#171222] mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-purple-600">Why IndoWings</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171222] leading-tight">
                Built for speed, safety, and reliability — every flight.
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                Our Cyberone Pro UAVs are purpose-built for last-mile urban delivery in dense Indian cities — handling traffic, weather, and building density that ground vehicles can't.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171222]">{f.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Drone Specs Card */}
            <div className="bg-[#0d0520] rounded-3xl p-7 text-white space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🚁</span>
                <div>
                  <h3 className="text-lg font-extrabold">IndoWings Cyberone Pro</h3>
                  <p className="text-xs text-white/50">Autonomous Delivery UAV · V3.4.4</p>
                </div>
              </div>

              {[
                { label: 'Max Payload', value: '5.0 kg' },
                { label: 'Range', value: '25 km' },
                { label: 'Cruise Speed', value: '65 km/h' },
                { label: 'Altitude', value: '90m AGL' },
                { label: 'Delivery Winch', value: 'Kevlar Tether' },
                { label: 'Weather Rating', value: 'IP55 · Wind ≤35 km/h' },
                { label: 'Obstacle Avoidance', value: 'LiDAR + Vision AI' },
                { label: 'Certification', value: 'DGCA BVLOS Class' },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-white/50 font-semibold">{s.label}</span>
                  <span className="text-sm font-bold text-white">{s.value}</span>
                </div>
              ))}

              <button
                onClick={() => onNavigate?.('order')}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
              >
                <Package className="w-4 h-4" />
                Book Now — Instant Dispatch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── COVERAGE ZONES ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8f6fc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-3">Coverage Area</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171222] mb-4">Delhi-NCR Air Corridors</h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto mb-10">
            Currently serving all major zones of Delhi, Noida, Gurugram, and Greater Noida with pre-certified autonomous flight corridors.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { zone: 'Noida Sec 62', type: 'UAV Hub' },
              { zone: 'Connaught Place', type: 'Drop Zone' },
              { zone: 'AIIMS Delhi', type: 'Medical Port' },
              { zone: 'Cyber City Gurgaon', type: 'Tech Corridor' },
              { zone: 'Dwarka Sec 21', type: 'Residential Hub' },
              { zone: 'Greater Noida', type: 'Express Zone' },
            ].map(z => (
              <div key={z.zone} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#171222]">{z.zone}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{z.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#1b073a] via-[#3b0080] to-[#1b073a] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-purple-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live fleet operational · Delhi-NCR
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl mx-auto">
            Ready to experience the future of delivery?
          </h2>
          <p className="text-white/60 text-base max-w-lg mx-auto">
            Join thousands of Delhi-NCR residents already using IndoWings for same-day medicine, document, and parcel delivery in under 24 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate?.('order')}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm bg-white text-[#3b0080] hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
              <Package className="w-5 h-5" />
              Book Drone Delivery Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate?.('track')}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              Track Existing Order
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
