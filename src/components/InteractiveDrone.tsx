import React from "react";
import { Shield, Radio, Sparkles, Navigation, Zap } from "lucide-react";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  return (
    <div className="relative w-full max-w-[500px] min-h-[520px] flex flex-col items-center justify-center select-none">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 bg-[#bc13fe]/20 blur-[100px] rounded-full scale-75 animate-pulse pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] bg-purple-600/15 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Circular Orbital Grid Rings ── */}
      <div className="absolute w-[420px] h-[420px] rounded-full border border-white/[0.06] border-dashed animate-[spin_80s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-purple-500/15 pointer-events-none" />

      {/* ── Main Floating Character Container ── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Character Image from CSCA */}
        <div className="relative flex justify-center">
          <img
            src="/images/floating-character.png"
            alt="IndoWings Flight Operator"
            className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] h-auto object-contain pointer-events-none"
            style={{
              animation: "floatGlow 3.5s ease-in-out infinite",
            }}
          />

          {/* Floating High-Tech Badge: Top Left */}
          <div className="absolute top-6 -left-2 sm:-left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120726]/85 border border-[#bc13fe]/40 backdrop-blur-md text-[10px] font-mono text-white shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">UAV COMMANDER</span>
          </div>

          {/* Floating High-Tech Badge: Bottom Right */}
          <div className="absolute bottom-12 -right-2 sm:-right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120726]/85 border border-purple-400/30 backdrop-blur-md text-[10px] font-mono text-purple-200 shadow-xl">
            <Radio className="w-3 h-3 text-[#bc13fe] animate-pulse" />
            <span className="tracking-wider">BVLOS TELEMETRY LIVE</span>
          </div>
        </div>

        {/* ── Soft Ground Shadow / Platform Pulse ── */}
        <div
          className="w-56 h-5 rounded-[100%] bg-[#bc13fe]/30 blur-[12px] -mt-4 pointer-events-none"
          style={{
            animation: "shadowPulse 3.5s ease-in-out infinite",
          }}
        />

        {/* ── Bottom Micro Telemetry Bar ── */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[400px] mt-6">
          {[
            { label: "FLIGHT CORRIDORS", val: "NCR ACTIVE" },
            { label: "FLEET RESPONSE", val: "< 24 MINS" },
            { label: "CERTIFICATION", val: "DGCA INDIA" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-center"
            >
              <p className="text-[8px] font-mono tracking-widest text-white/40 uppercase font-bold">{item.label}</p>
              <p className="text-[11px] font-black text-white mt-0.5 font-mono">{item.val}</p>
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
