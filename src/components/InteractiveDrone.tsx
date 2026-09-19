import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

interface InteractiveDroneProps {
  onOrderClick?: () => void;
}

export const InteractiveDrone: React.FC<InteractiveDroneProps> = ({ onOrderClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") ||
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");

    if (!gl) {
      console.warn("WebGL not supported");
      setLoadError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGLRenderer initialization failed", e);
      setLoadError(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 420;
    renderer.setSize(width, height, false);

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.outline = "none";
    canvas.style.cursor = "grab";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 100);
    camera.position.set(5, 3.5, 6.5);

    const group = new THREE.Group();
    scene.add(group);

    // Inner occluding body mesh matching hero dark background (pure FlytBase style)
    // flytbase used 1710618 (#1a1a1a); for IndoWings purple-black background, 0x140d25 seamlessly blends
    const bodyMaterial = new THREE.MeshBasicMaterial({
      color: 0x120a22,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });

    // Pure Titanium White CAD wireframe lines (100% FlytBase exact aesthetic - zero cyan/color tint)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
    });

    let mergedGeom: THREE.BufferGeometry | null = null;
    let edgesGeom: THREE.BufferGeometry | null = null;
    let isDisposed = false;
    let animId = 0;
    let prevTime = 0;
    let elapsedTime = 0;

    // Interaction variables
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    // Drag to rotate in 3D
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragRotOffset = { x: 0, y: 0 };

    const loader = new STLLoader();
    loader.load(
      "/models/drone.stl",
      (geometry) => {
        if (isDisposed) {
          geometry.dispose();
          return;
        }

        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.4 / (maxDim || 1);
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.scale(scale, scale, scale);

        mergedGeom = mergeVertices(geometry, 0.01);
        geometry.dispose();
        mergedGeom.rotateY(Math.PI);

        // Solid occluding body
        const mesh = new THREE.Mesh(mergedGeom, bodyMaterial);
        group.add(mesh);

        // Exact FlytBase 45-degree threshold CAD wireframe
        edgesGeom = new THREE.EdgesGeometry(mergedGeom, 45);
        const wireframe = new THREE.LineSegments(edgesGeom, wireframeMaterial);
        group.add(wireframe);

        // Camera alignment
        const bounds = new THREE.Box3().setFromObject(mesh);
        const boundCenter = bounds.getCenter(new THREE.Vector3());
        const boundSize = bounds.getSize(new THREE.Vector3()).length();
        camera.position.copy(boundCenter).add(
          new THREE.Vector3(0.6 * boundSize, 0.42 * boundSize, 0.8 * boundSize)
        );
        camera.lookAt(boundCenter);

        setLoaded(true);
        startRenderLoop();
      },
      undefined,
      (err) => {
        console.error("Failed to load /models/drone.stl", err);
        setLoadError(true);
      }
    );

    const render = (time: number) => {
      if (isDisposed) return;

      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 0;
      prevTime = time;
      elapsedTime += dt;

      // Smooth dampening towards cursor
      const smoothFactor = 1 - Math.exp(-6 * dt);
      currentRotY += (targetRotY - currentRotY) * smoothFactor;
      currentRotX += (targetRotX - currentRotX) * smoothFactor;

      // Floating drone physics (FlytBase harmonic curve)
      group.rotation.y =
        dragRotOffset.y + currentRotY + 0.04 * Math.sin(0.9 * elapsedTime) * 0.5;
      group.rotation.x = dragRotOffset.x + currentRotX;
      group.rotation.z = 0.04 * Math.sin(0.9 * elapsedTime);
      group.position.y = 0.18 * Math.sin(1.6 * elapsedTime);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    const startRenderLoop = () => {
      if (!animId && !isDisposed) {
        prevTime = 0;
        animId = requestAnimationFrame(render);
      }
    };

    // Mouse tracking tilt
    const handlePointerMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        dragRotOffset.y += deltaX * 0.008;
        dragRotOffset.x += deltaY * 0.008;
        dragRotOffset.x = Math.max(-0.6, Math.min(0.6, dragRotOffset.x));
        prevMousePos = { x: e.clientX, y: e.clientY };
        return;
      }

      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      targetRotY = Math.max(-0.4, Math.min(0.4, 0.35 * nx));
      targetRotX = Math.max(-0.22, Math.min(0.22, 0.18 * ny));
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = "grabbing";
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || 440;
      const h = container.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !animId) {
          startRenderLoop();
        } else if (!entry.isIntersecting && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      }
    });
    visibilityObserver.observe(container);

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      group.clear();
      mergedGeom?.dispose();
      edgesGeom?.dispose();
      bodyMaterial.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-[460px] flex flex-col items-center justify-center select-none py-1">
      {/* ── Soft Ambient Radial Glow behind the Drone (Clean & Premium) ── */}
      <div className="absolute inset-0 bg-[#bc13fe]/15 blur-[70px] sm:blur-[100px] rounded-full scale-90 pointer-events-none" />
      <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] bg-purple-600/10 blur-[50px] sm:blur-[80px] rounded-full pointer-events-none" />

      {/* ── Subtle Elegant Outer Rings ── */}
      <div className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] rounded-full border border-white/[0.05] border-dashed animate-[spin_120s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[190px] h-[190px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] rounded-full border border-white/[0.04] pointer-events-none" />

      {/* ── 3D Canvas Mount Container ── */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-[270px] sm:h-[340px] lg:h-[390px] flex items-center justify-center"
      >
        {/* Subtle loading indicator */}
        {!loaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40 pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          </div>
        )}
      </div>

      {/* ── Minimalist Soft Ground Shadow ── */}
      <div
        className="w-40 sm:w-52 h-3.5 sm:h-4 rounded-[100%] bg-black/40 blur-[10px] sm:blur-[12px] -mt-5 sm:-mt-6 pointer-events-none z-10"
        style={{ animation: "droneShadowPulse 3.5s ease-in-out infinite" }}
      />

      {/* ── Embedded CSS Animation ── */}
      <style>{`
        @keyframes droneShadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.45;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.18;
          }
        }
      `}</style>
    </div>
  );
};
