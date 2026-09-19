import React, { useState, useEffect, useRef } from "react";
import { Crosshair, Compass, Shield, Zap } from "lucide-react";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [hoverY, setHoverY] = useState(0);
  const [telemetry, setTelemetry] = useState({
    bearing: 54,
    pitch: 0,
    roll: 0,
    cursorX: 0,
    cursorY: 0,
  });

  useEffect(() => {
    let animFrame: number;
    let targetPitch = 0;
    let targetYaw = 0;
    let targetRoll = 0;
    let curPitch = 0;
    let curYaw = 0;
    let curRoll = 0;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // 3D aircraft pitch (-18 to +18 degrees)
      targetPitch = Math.max(-18, Math.min(18, -dy * 0.035));
      // 3D aircraft yaw (-30 to +30 degrees)
      targetYaw = Math.max(-32, Math.min(32, dx * 0.045));
      // 3D aircraft roll / banking (-14 to +14 degrees)
      targetRoll = Math.max(-14, Math.min(14, dx * 0.025));

      // Calculate bearing angle (0-360 deg)
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;

      setTelemetry({
        bearing: Math.round(deg),
        pitch: Number(targetPitch.toFixed(1)),
        roll: Number(targetRoll.toFixed(1)),
        cursorX: Math.round(e.clientX),
        cursorY: Math.round(e.clientY),
      });
    };

    // Smooth physics LERP loop
    const animate = () => {
      time += 0.03;
      // Gentle natural hovering bobbing
      const naturalHover = Math.sin(time) * 8;
      setHoverY(naturalHover);

      curPitch += (targetPitch - curPitch) * 0.08;
      curYaw += (targetYaw - curYaw) * 0.08;
      curRoll += (targetRoll - curRoll) * 0.08;

      setRotation({
        pitch: curPitch,
        yaw: curYaw,
        roll: curRoll,
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
      className="relative w-full max-w-[540px] h-[480px] flex items-center justify-center select-none"
      style={{ perspective: "1200px" }}
    >
      {/* ─── TECHNICAL RADAR HUD BACKGROUND ─── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Subtle aerospace dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Concentric radar rings */}
        <div className="w-[420px] h-[420px] rounded-full border border-white/[0.07] border-dashed animate-[spin_120s_linear_infinite]" />
        <div className="absolute w-[320px] h-[320px] rounded-full border border-purple-500/15" />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-white/[0.05]" />

        {/* Axis reticle lines */}
        <div className="absolute w-[460px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
        <div className="absolute h-[420px] w-[1px] bg-gradient-to-b from-transparent via-purple-500/25 to-transparent" />

        {/* Atmospheric backlight */}
        <div className="absolute w-72 h-72 bg-purple-600/15 blur-[90px] rounded-full" />
      </div>

      {/* ─── LIVE TELEMETRY TOP BAR ─── */}
      <div className="absolute top-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-wider z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/90 font-bold">CYBERONE-PRO · IW-247</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 backdrop-blur-md">
          <Crosshair className="w-3.5 h-3.5 animate-spin" />
          <span>CURSOR TRACKING</span>
        </div>
      </div>

      {/* ─── 3D ROTATING ENTERPRISE DRONE (From User Photo) ─── */}
      <div
        className="relative z-10 w-[420px] h-[300px] flex items-center justify-center transition-transform ease-out cursor-crosshair"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateY(${hoverY}px) rotateX(${rotation.pitch}deg) rotateY(${rotation.yaw}deg) rotateZ(${rotation.roll}deg)`,
        }}
      >
        {/* The Exact FlytBase Wireframe Drone Image */}
        <img
          src="/images/flyt-drone.png"
          alt="IndoWings Cyberone UAV"
          className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] filter brightness-110 contrast-125"
          style={{
            filter: "drop-shadow(0 0 16px rgba(168, 85, 247, 0.35)) drop-shadow(0 0 30px rgba(99, 102, 241, 0.2))",
          }}
        />

        {/* Dynamic Spinning Rotor Glow Discs (positioned on the 4 propeller hubs) */}
        {/* Front-Left Motor */}
        <div
          className="absolute top-[18%] left-[10%] w-24 h-6 rounded-[100%] pointer-events-none animate-[spin_0.15s_linear_infinite]"
          style={{
            background: "radial-gradient(ellipse, rgba(168, 85, 247, 0.45) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 100%)",
            boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)",
          }}
        />
        {/* Front-Right Motor */}
        <div
          className="absolute top-[28%] right-[10%] w-24 h-6 rounded-[100%] pointer-events-none animate-[spin_0.15s_linear_infinite]"
          style={{
            background: "radial-gradient(ellipse, rgba(56, 189, 248, 0.45) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 100%)",
            boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)",
          }}
        />
        {/* Rear-Left Motor */}
        <div
          className="absolute bottom-[35%] left-[2%] w-20 h-5 rounded-[100%] pointer-events-none animate-[spin_0.18s_linear_infinite]"
          style={{
            background: "radial-gradient(ellipse, rgba(239, 68, 68, 0.4) 0%, transparent 80%)",
          }}
        />
        {/* Rear-Right Motor */}
        <div
          className="absolute bottom-[20%] right-[22%] w-20 h-5 rounded-[100%] pointer-events-none animate-[spin_0.18s_linear_infinite]"
          style={{
            background: "radial-gradient(ellipse, rgba(34, 197, 94, 0.4) 0%, transparent 80%)",
          }}
        />

        {/* Aviation Navigation Strobe LEDs */}
        {/* Port (Red) Strobe */}
        <div className="absolute top-[20%] left-[8%] w-2 h-2 rounded-full bg-red-500 animate-ping pointer-events-none shadow-[0_0_10px_#ef4444]" />
        {/* Starboard (Green) Strobe */}
        <div className="absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-emerald-400 animate-ping pointer-events-none shadow-[0_0_10px_#22c55e]" />
        {/* Gimbal Optical Camera Laser Tracker */}
        <div className="absolute bottom-[32%] left-[45%] w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse pointer-events-none shadow-[0_0_12px_#38bdf8]" />
      </div>

      {/* ─── LIVE TELEMETRY HUD OVERLAYS ─── */}
      <div className="absolute bottom-2 left-4 font-mono text-[10px] space-y-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 backdrop-blur-md pointer-events-none text-white/70">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>AZIMUTH: <strong className="text-white">{telemetry.bearing}°</strong></span>
        </div>
        <div>PITCH: <span className="text-purple-300">{telemetry.pitch > 0 ? `+${telemetry.pitch}` : telemetry.pitch}°</span></div>
        <div>ROLL: <span className="text-purple-300">{telemetry.roll > 0 ? `+${telemetry.roll}` : telemetry.roll}°</span></div>
      </div>

      <div className="absolute bottom-2 right-4 font-mono text-[10px] space-y-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 backdrop-blur-md pointer-events-none text-right text-white/70">
        <div className="text-emerald-400 font-bold flex items-center justify-end gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AUTONOMOUS HOVER</span>
        </div>
        <div>ALTITUDE: <strong className="text-white">90M AGL</strong></div>
        <div>SPEED: <strong className="text-white">65 KM/H</strong></div>
      </div>
    </div>
  );
};
