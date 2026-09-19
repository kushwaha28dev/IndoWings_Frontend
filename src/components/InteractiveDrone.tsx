import React, { useState, useEffect, useRef } from "react";
import { Crosshair, Radio, Shield, Zap, Compass } from "lucide-react";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [telemetry, setTelemetry] = useState({
    bearing: 42,
    pitch: 0,
    roll: 0,
    dist: 120,
    tracking: true,
  });

  useEffect(() => {
    let animFrame: number;
    let targetPitch = 0;
    let targetRoll = 0;
    let targetYaw = 0;
    let curPitch = 0;
    let curRoll = 0;
    let curYaw = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Calculate bearing angle (0-360 degrees)
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;

      // Realistic 3D aircraft tilt
      targetPitch = Math.max(-25, Math.min(25, -dy * 0.05));
      targetRoll = Math.max(-30, Math.min(30, dx * 0.055));
      
      // Calculate delta yaw so drone rotates towards cursor
      let yawAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      // Clamp or smooth yaw
      targetYaw = yawAngle;

      setTelemetry({
        bearing: Math.round(deg),
        pitch: Number(targetPitch.toFixed(1)),
        roll: Number(targetRoll.toFixed(1)),
        dist: Math.round(Math.sqrt(dx * dx + dy * dy)),
        tracking: true,
      });
    };

    // Smooth physics interpolation (LERP)
    const animate = () => {
      curPitch += (targetPitch - curPitch) * 0.08;
      curRoll += (targetRoll - curRoll) * 0.08;

      // Shortest path interpolation for yaw rotation
      let diff = (targetYaw - curYaw + 540) % 360 - 180;
      curYaw += diff * 0.08;

      setRotation({
        pitch: curPitch,
        roll: curRoll,
        yaw: curYaw,
      });

      animFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] h-[520px] flex items-center justify-center select-none"
      style={{ perspective: "1000px" }}
    >
      {/* ─── AEROSPACE RADAR HUD BACKGROUND ─── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer compass ring */}
        <div className="w-[440px] h-[440px] rounded-full border border-purple-500/15 border-dashed animate-[spin_60s_linear_infinite]" />
        
        {/* Concentric radar rings */}
        <div className="absolute w-[340px] h-[340px] rounded-full border border-white/10" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-purple-500/20" />
        <div className="absolute w-[120px] h-[120px] rounded-full border border-white/5" />

        {/* Crosshair grid lines */}
        <div className="absolute w-[460px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute h-[460px] w-[1px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

        {/* Ambient glow underneath drone */}
        <div className="absolute w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full" />
      </div>

      {/* ─── LIVE TELEMETRY TOP BAR ─── */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono tracking-wider z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 font-bold">CYBERONE-PRO · IW-247</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 backdrop-blur-md">
          <Crosshair className="w-3.5 h-3.5 animate-spin" />
          <span>CURSOR LOCK: ACTIVE</span>
        </div>
      </div>

      {/* ─── 3D ROTATING DRONE ASSEMBLY ─── */}
      <div
        className="relative z-10 w-[380px] h-[380px] flex items-center justify-center transition-transform ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.pitch}deg) rotateY(${rotation.roll}deg) rotateZ(${rotation.yaw}deg)`,
        }}
      >
        {/* Forward Laser Guidance Beam (points toward cursor) */}
        <div
          className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 h-[220px] pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(168, 85, 247, 0.8), rgba(99, 102, 241, 0.4), transparent)",
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.9)",
            transformOrigin: "bottom center",
          }}
        />

        {/* DRONE SVG TECHNICAL WIREFRAME (Flytbase Style) */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Carbon Fiber Arms (Diagonal X-Frame) */}
          <line x1="110" y1="110" x2="390" y2="390" stroke="#a78bfa" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
          <line x1="390" y1="110" x2="110" y2="390" stroke="#a78bfa" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
          <line x1="110" y1="110" x2="390" y2="390" stroke="#ffffff" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />
          <line x1="390" y1="110" x2="110" y2="390" stroke="#ffffff" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />

          {/* Landing Struts */}
          <path d="M 170 170 L 140 220 L 140 280 L 170 330" stroke="#6366f1" strokeWidth="5" fill="none" opacity="0.7" />
          <path d="M 330 170 L 360 220 L 360 280 L 330 330" stroke="#6366f1" strokeWidth="5" fill="none" opacity="0.7" />

          {/* Rotor Motor Pods */}
          {[
            { cx: 110, cy: 110, light: "#ef4444" }, // Front-Left (Red Nav)
            { cx: 390, cy: 110, light: "#22c55e" }, // Front-Right (Green Nav)
            { cx: 110, cy: 390, light: "#a855f7" }, // Rear-Left
            { cx: 390, cy: 390, light: "#3b82f6" }, // Rear-Right
          ].map((rotor, idx) => (
            <g key={idx}>
              {/* Spinning Propeller Disc Blur */}
              <circle
                cx={rotor.cx}
                cy={rotor.cy}
                r="72"
                fill="url(#rotorGrad)"
                className="animate-[spin_0.25s_linear_infinite]"
                style={{ transformOrigin: `${rotor.cx}px ${rotor.cy}px` }}
              />
              <circle cx={rotor.cx} cy={rotor.cy} r="72" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="16 10" opacity="0.4" />
              
              {/* Motor Housing */}
              <circle cx={rotor.cx} cy={rotor.cy} r="22" fill="#1e1b4b" stroke="#c084fc" strokeWidth="3" />
              <circle cx={rotor.cx} cy={rotor.cy} r="10" fill="#0f0e1f" />
              <circle cx={rotor.cx} cy={rotor.cy} r="4" fill={rotor.light} className="animate-ping" />
            </g>
          ))}

          {/* Main Fuselage Body (Aerodynamic Shield) */}
          <polygon
            points="250,140 310,185 320,310 250,355 180,310 190,185"
            fill="#0f0728"
            stroke="#8b5cf6"
            strokeWidth="4"
          />
          {/* Internal Armor Layers */}
          <polygon
            points="250,165 295,200 300,295 250,330 200,295 205,200"
            fill="#1c103f"
            stroke="#c084fc"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* IndoWings Wingtip Crest on Top Deck */}
          <path d="M 230 240 L 250 215 L 270 240 L 250 255 Z" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="250" cy="275" r="7" fill="#38bdf8" />

          {/* Forward Gimbal Optical Camera (Pointing forward/cursor) */}
          <g>
            <rect x="232" y="125" width="36" height="30" rx="8" fill="#18181b" stroke="#a855f7" strokeWidth="2.5" />
            <circle cx="250" cy="140" r="10" fill="#09090b" stroke="#60a5fa" strokeWidth="2" />
            <circle cx="250" cy="140" r="5" fill="#38bdf8" className="animate-pulse" />
            {/* Camera IR Laser Beam Dot */}
            <circle cx="250" cy="115" r="3" fill="#ef4444" />
          </g>

          {/* Gradients */}
          <defs>
            <radialGradient id="rotorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(192, 132, 252, 0.35)" />
              <stop offset="70%" stopColor="rgba(129, 140, 248, 0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* 3D Directional Reticle Ring around Center */}
        <div className="absolute w-28 h-28 rounded-full border border-purple-400/40 pointer-events-none" />
      </div>

      {/* ─── LIVE TELEMETRY HUD OVERLAYS (Bottom Left & Right) ─── */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] space-y-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md pointer-events-none text-white/70">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>AZIMUTH: <strong className="text-white">{telemetry.bearing}°</strong></span>
        </div>
        <div>PITCH: <span className="text-purple-300">{telemetry.pitch > 0 ? `+${telemetry.pitch}` : telemetry.pitch}°</span></div>
        <div>BANK: <span className="text-purple-300">{telemetry.roll > 0 ? `+${telemetry.roll}` : telemetry.roll}°</span></div>
      </div>

      <div className="absolute bottom-4 right-4 font-mono text-[10px] space-y-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md pointer-events-none text-right text-white/70">
        <div className="text-emerald-400 font-bold flex items-center justify-end gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>DGCA BVLOS LINK</span>
        </div>
        <div>ALTITUDE: <strong className="text-white">90M AGL</strong></div>
        <div>VELOCITY: <strong className="text-white">65 KM/H</strong></div>
      </div>
    </div>
  );
};
