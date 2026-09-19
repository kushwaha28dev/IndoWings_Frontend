import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

interface ScrollDroneFlightProps {
  heroSlotId?: string;
  featuresSlotId?: string;
}

export const ScrollDroneFlight: React.FC<ScrollDroneFlightProps> = ({
  heroSlotId = "hero-drone-slot",
  featuresSlotId = "features-drone-slot",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("[ScrollDroneFlight] WebGL init failed", e);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const droneGroup = new THREE.Group();
    scene.add(droneGroup);

    const bodyMaterial = new THREE.MeshBasicMaterial({
      color: 0x0f091f,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
    });

    let mergedGeom: THREE.BufferGeometry | null = null;
    let edgesGeom: THREE.BufferGeometry | null = null;
    let isDisposed = false;

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
        const scale = 3.0 / (maxDim || 1);
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.scale(scale, scale, scale);

        mergedGeom = mergeVertices(geometry, 0.01);
        geometry.dispose();
        mergedGeom.rotateY(Math.PI);

        const mesh = new THREE.Mesh(mergedGeom, bodyMaterial);
        droneGroup.add(mesh);

        edgesGeom = new THREE.EdgesGeometry(mergedGeom, 45);
        const wireframe = new THREE.LineSegments(edgesGeom, wireframeMaterial);
        droneGroup.add(wireframe);

        setModelLoaded(true);
      },
      undefined,
      (err) => console.error("[ScrollDroneFlight] Failed to load STL", err)
    );

    const screenToWorld = (screenX: number, screenY: number, targetZ = 0) => {
      const dist = camera.position.z - targetZ;
      const vFOV = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
      const visibleWidth = visibleHeight * camera.aspect;

      const wx = (screenX / window.innerWidth - 0.5) * visibleWidth;
      const wy = -(screenY / window.innerHeight - 0.5) * visibleHeight;
      return { x: wx, y: wy };
    };

    let smoothProgress = 0;
    let prevSmoothProgress = 0;
    let animId = 0;
    let prevTime = 0;
    let elapsedTime = 0;

    let mouseTilt = { x: 0, y: 0 };
    let smoothMouseTilt = { x: 0, y: 0 };

    const getFlightProgress = () => {
      const featuresEl = document.getElementById(featuresSlotId);
      if (!featuresEl) return 0;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const startScroll = 40;

      const featuresRect = featuresEl.getBoundingClientRect();
      const featuresAbsTop = scrollY + featuresRect.top;
      const endScroll = Math.max(
        startScroll + 200,
        featuresAbsTop - window.innerHeight * 0.35
      );

      const raw = (scrollY - startScroll) / (endScroll - startScroll);
      return Math.max(0, Math.min(1, raw));
    };

    const render = (time: number) => {
      if (isDisposed) return;

      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 0;
      prevTime = time;
      elapsedTime += dt;

      const targetProgress = getFlightProgress();
      smoothProgress += (targetProgress - smoothProgress) * 0.085;
      const p = smoothProgress;

      const progressDelta = p - prevSmoothProgress;
      prevSmoothProgress = p;
      const scrollVelocity = Math.abs(progressDelta) / (dt || 0.016);

      const heroEl = document.getElementById(heroSlotId);
      const featuresEl = document.getElementById(featuresSlotId);

      let heroScreen = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.4 };
      let featuresScreen = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.45 };

      if (heroEl) {
        const r = heroEl.getBoundingClientRect();
        heroScreen = { x: r.left + r.width * 0.5, y: r.top + r.height * 0.46 };
      }

      if (featuresEl) {
        const r = featuresEl.getBoundingClientRect();
        featuresScreen = { x: r.left + r.width * 0.5, y: r.top + r.height * 0.46 };
      }

      const heroWorld = screenToWorld(heroScreen.x, heroScreen.y);
      const featuresWorld = screenToWorld(featuresScreen.x, featuresScreen.y);

      const baseX = heroWorld.x + (featuresWorld.x - heroWorld.x) * p;
      const baseY = heroWorld.y + (featuresWorld.y - heroWorld.y) * p;

      const weaveIntensity = (1 - Math.pow(2 * p - 1, 4));
      const weaveX = Math.sin(p * Math.PI * 2) * -2.4 * weaveIntensity;

      const altitudeZ = Math.sin(p * Math.PI) * 1.8;

      const idleBobY = 0.1 * Math.sin(elapsedTime * 2.2);
      const idleBobRoll = 0.025 * Math.sin(elapsedTime * 1.6);

      droneGroup.position.set(
        baseX + weaveX,
        baseY + idleBobY,
        altitudeZ
      );

      const baseRotX = 0.35;
      const baseRotY = Math.PI * 0.25;

      const bankRoll = Math.cos(p * Math.PI * 2) * 0.5 * weaveIntensity;
      const flightYaw = Math.cos(p * Math.PI * 2) * 0.65 * weaveIntensity;
      const divePitch = p < 0.85 ? Math.min(0.3, scrollVelocity * 0.15) : -0.15 * (1 - (p - 0.85) / 0.15);

      // Smoothly track cursor for natural rotation follow
      const mouseFollowSpeed = 1 - Math.exp(-6.5 * dt);
      smoothMouseTilt.x += (mouseTilt.x - smoothMouseTilt.x) * mouseFollowSpeed;
      smoothMouseTilt.y += (mouseTilt.y - smoothMouseTilt.y) * mouseFollowSpeed;

      droneGroup.rotation.x =
        baseRotX + divePitch + smoothMouseTilt.y * 0.35;
      droneGroup.rotation.y =
        baseRotY + flightYaw + smoothMouseTilt.x * 0.55;
      droneGroup.rotation.z =
        bankRoll + idleBobRoll + smoothMouseTilt.x * 0.2;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates: -1 to +1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseTilt = { x: nx, y: ny };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    animId = requestAnimationFrame(render);

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      droneGroup.clear();
      mergedGeom?.dispose();
      edgesGeom?.dispose();
      bodyMaterial.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, [heroSlotId, featuresSlotId, isDesktop]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 w-full h-full"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
};
