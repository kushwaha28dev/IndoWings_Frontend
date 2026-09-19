import React from "react";
import { Shield, Zap, Navigation, Radio, Sparkles } from "lucide-react";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  return (
    <div className="relative w-full max-w-[560px] flex flex-col items-center justify-center select-none py-4">
      {/* ── Atmospheric Aerospace Glows ── */}
      <div className="absolute w-[360px] h-[360px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute w-[240px] h-[240px] bg-indigo-500/15 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Radar Circle Backdrop (FlytBase Style) ── */}
      <div className="absolute w-[440px] h-[440px] rounded-full border border-white/[0.06] border-dashed animate-[spin_90s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[320px] h-[320px] rounded-full border border-purple-500/15 pointer-events-none" />

      {/* ── Floating Drone Assembly ── */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Floating Drone Image Container */}
        <div
          className="relative w-[440px] sm:w-[480px] aspect-square rounded-3xl overflow-hidden flex items-center justify-center"
          style={{
            animation: "droneFloat 4.5s ease-in-out infinite",
          }}
        >
          {/* Subtle radial fade around image borders so it blends seamlessly */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "radial-gradient(circle at 50% 50%, transparent 60%, #0c051f 100%)",
            }}
          />

          <img
            src="/images/enterprise-drone.jpg"
            alt="IndoWings Cyberone 3D UAV"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
            style={{
              mixBlendMode: "screen",
            }}
          />

          {/* Floating Spec Tag: Top Right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e0624]/80 border border-purple-500/30 backdrop-blur-md text-[11px] font-mono text-purple-200 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">CYBERONE-PRO</span>
          </div>

          {/* Floating Spec Tag: Bottom Left */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e0624]/80 border border-white/10 backdrop-blur-md text-[10px] font-mono text-white/80 shadow-xl">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>KEVLAR WINCH TETHER</span>
          </div>
        </div>

        {/* ── Realistic Dynamic Ground Shadow ── */}
        <div
          className="w-[280px] h-6 rounded-[100%] bg-black/60 blur-[10px] -mt-6 pointer-events-none"
          style={{
            animation: "shadowPulse 4.5s ease-in-out infinite",
          }}
        />

        {/* ── High-Tech Telemetry Strip ── */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[440px] mt-6">
          {[
            { label: "PAYLOAD", val: "5.0 KG" },
            { label: "CRUISE SPEED", val: "65 KM/H" },
            { label: "BVLOS LINK", val: "DGCA CERT" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-3 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-center"
            >
              <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase font-bold">{item.label}</p>
              <p className="text-xs font-black text-white mt-0.5 font-mono">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Custom CSS Keyframes */}
      <style>{`
        @keyframes droneFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(0.6deg);
          }
        }
        @keyframes shadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(0.78);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
};
