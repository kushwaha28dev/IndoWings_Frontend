import React from "react";
import { Shield, Radio, Sparkles, Navigation, Zap } from "lucide-react";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  return (
    <div className="relative w-full max-w-[420px] min-h-[420px] flex flex-col items-center justify-center select-none py-2">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 bg-[#bc13fe]/15 blur-[90px] rounded-full scale-75 animate-pulse pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] bg-purple-600/15 blur-[70px] rounded-full pointer-events-none" />

      {/* ── Circular Orbital Grid Rings ── */}
      <div className="absolute w-[340px] h-[340px] rounded-full border border-white/[0.06] border-dashed animate-[spin_80s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[240px] h-[240px] rounded-full border border-purple-500/15 pointer-events-none" />

      {/* ── Main Floating Character Container ── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Character Image from CSCA */}
        <div className="relative flex justify-center">
          <img
            src="/images/floating-character.png"
            alt="IndoWings Flight Operator"
            className="relative z-10 w-full max-w-[210px] sm:max-w-[250px] h-auto object-contain pointer-events-none"
            style={{
              animation: "floatGlow 3.5s ease-in-out infinite",
            }}
          />

          {/* Floating High-Tech Badge: Top Left */}
          <div className="absolute top-4 -left-3 sm:-left-6 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#120726]/90 border border-[#bc13fe]/40 backdrop-blur-md text-[9px] font-mono text-white shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">UAV PILOT</span>
          </div>

          {/* Floating High-Tech Badge: Bottom Right */}
          <div className="absolute bottom-8 -right-3 sm:-right-5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120726]/90 border border-purple-400/30 backdrop-blur-md text-[9px] font-mono text-purple-200 shadow-xl">
            <Radio className="w-3 h-3 text-[#bc13fe] animate-pulse" />
            <span className="tracking-wider">BVLOS ACTIVE</span>
          </div>
        </div>

        {/* ── Soft Ground Shadow / Platform Pulse ── */}
        <div
          className="w-40 h-4 rounded-[100%] bg-[#bc13fe]/25 blur-[10px] -mt-3 pointer-events-none"
          style={{
            animation: "shadowPulse 3.5s ease-in-out infinite",
          }}
        />

        {/* ── Bottom Micro Telemetry Bar ── */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[340px] mt-4">
          {[
            { label: "CORRIDORS", val: "NCR ACTIVE" },
            { label: "RESPONSE", val: "< 24 MINS" },
            { label: "CERTIFIED", val: "DGCA INDIA" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-center"
            >
              <p className="text-[7.5px] font-mono tracking-widest text-white/40 uppercase font-bold">{item.label}</p>
              <p className="text-[10px] font-black text-white mt-0.5 font-mono">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Embedded CSS Animation (Exact CSCA Style) ── */}
      <style>{`
        @keyframes floatGlow {
          0%, 100% {
            transform: translateY(0);
            filter: drop-shadow(0 0 15px rgba(188, 19, 254, 0.45));
          }
          50% {
            transform: translateY(-16px);
            filter: drop-shadow(0 0 35px rgba(188, 19, 254, 0.85));
          }
        }
        @keyframes shadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(0.75);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};
