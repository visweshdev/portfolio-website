"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { playSound } from "@/lib/sound";

const MAX_PULSES = 4;
const PULSE_DURATION = 1.6; // seconds to travel the full curve

/**
 * The site's signature motif rendered in 3D: a single thin curve that
 * reads simultaneously as a racing line, a neural-network path, and a
 * camera focus track.
 *
 * Two real interactions, not just decoration:
 *  1. The line is magnetically drawn toward the cursor — points near it
 *     bulge and spring back with real inertia, like elastic under load.
 *  2. Clicking anywhere sends a pulse of light travelling the full
 *     length of the curve, timing-light style.
 */
function SignatureCurve({ simplified }: { simplified: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRot = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);
  const pointerLocal = useRef({ x: 999, y: 999 });
  const { viewport } = useThree();

  const segments = simplified ? 60 : 140;

  const { curve, basePositions, nodePoints } = useMemo(() => {
    const controlPoints = [
      new THREE.Vector3(-7.5, -1.6, -1.5),
      new THREE.Vector3(-4.5, 1.3, -0.6),
      new THREE.Vector3(-1.8, -1.1, 0.4),
      new THREE.Vector3(0.6, 1.5, -0.3),
      new THREE.Vector3(3.2, -0.6, 0.6),
      new THREE.Vector3(5.6, 1.1, -0.2),
      new THREE.Vector3(8, -0.3, 0.3),
    ];
    const c = new THREE.CatmullRomCurve3(controlPoints, false, "catmullrom", 0.4);
    const pts = c.getPoints(segments);
    const positions = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    const nodeIdx = simplified ? [10, 30, 50] : [15, 40, 65, 90, 115];
    const nodes = nodeIdx.map((i) => pts[i]).filter(Boolean);
    return { curve: c, basePositions: positions, nodePoints: nodes };
  }, [simplified, segments]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(basePositions.slice(), 3));
    return geo;
  }, [basePositions]);

  const lineObject = useMemo(
    () => new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#f5f5f0", transparent: true, opacity: 0.32 })),
    [geometry]
  );

  // live, elastically-displaced copy of basePositions. Re-synced
  // whenever basePositions itself changes (e.g. the simplified/full
  // point count swaps across the mobile breakpoint) — checked inside
  // the frame loop itself (not an effect) so there's no race between a
  // resize re-render and the next animation frame reading a stale,
  // differently-sized array and corrupting the buffer with NaNs.
  const livePositions = useRef(basePositions.slice());

  // a small fixed pool of travelling pulses
  const pulses = useRef(
    Array.from({ length: MAX_PULSES }, () => ({ active: false, t: 0 }))
  );
  const nextPulse = useRef(0);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      targetRot.current.x = (e.clientY / window.innerHeight - 0.5) * 0.2;
      targetRot.current.y = (e.clientX / window.innerWidth - 0.5) * 0.25;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerLocal.current = { x: ndcX * (viewport.width / 2), y: ndcY * (viewport.height / 2) };
    }
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      scrollProgress.current = max > 0 ? window.scrollY / max : 0;
    }
    function onClick() {
      if (window.scrollY > window.innerHeight) return; // only while hero is roughly in view
      const slot = nextPulse.current % MAX_PULSES;
      pulses.current[slot] = { active: true, t: 0 };
      nextPulse.current += 1;
      playSound("whoosh");
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
    };
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (g) {
      g.rotation.x += (targetRot.current.x - g.rotation.x) * 0.04;
      g.rotation.y += (targetRot.current.y - g.rotation.y) * 0.04;
      g.rotation.z = scrollProgress.current * 0.35;
      g.position.x = -scrollProgress.current * 1.4;
    }

    // self-heal if basePositions changed length since the last frame
    // (e.g. a resize just crossed the mobile/desktop breakpoint)
    if (livePositions.current.length !== basePositions.length) {
      livePositions.current = basePositions.slice();
    }

    // elastic attraction toward the cursor, with spring-back inertia
    const live = livePositions.current;
    const base = basePositions;
    const cx = pointerLocal.current.x;
    const cy = pointerLocal.current.y;
    // Kept deliberately gentle: a strong pull would drag a bright node
    // wherever the cursor happens to be — often right over the headline.
    const radius = 1.8;
    for (let i = 0; i < live.length; i += 3) {
      const bx = base[i], by = base[i + 1], bz = base[i + 2];
      const dx = bx - cx;
      const dy = by - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - dist / radius);
      const eased = pull * pull * (3 - 2 * pull); // smoothstep
      const targetX = bx - dx * eased * 0.22;
      const targetY = by - dy * eased * 0.22;
      const targetZ = bz + eased * 0.5;
      live[i] += (targetX - live[i]) * 0.12;
      live[i + 1] += (targetY - live[i + 1]) * 0.12;
      live[i + 2] += (targetZ - live[i + 2]) * 0.12;
    }
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.array = live;
    attr.needsUpdate = true;

    // advance travelling pulses
    pulses.current.forEach((pulse, idx) => {
      const mesh = pulseRefs.current[idx];
      if (!mesh) return;
      if (!pulse.active) {
        mesh.visible = false;
        return;
      }
      pulse.t += delta / PULSE_DURATION;
      if (pulse.t >= 1) {
        pulse.active = false;
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const p = curve.getPointAt(Math.min(pulse.t, 1));
      mesh.position.copy(p);
      const fade = pulse.t < 0.85 ? 1 : (1 - pulse.t) / 0.15;
      (mesh.material as THREE.MeshBasicMaterial).opacity = fade;
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={lineObject} />

      {/* kept faint on purpose — these sit at fixed points along the
          curve and can coincidentally land near the headline; a bright
          node there would read as a stray mark, not a signal */}
      {nodePoints.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i % 2 === 0 ? 0.04 : 0.03, 12, 12]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#e8a33d" : "#f5f5f0"} transparent opacity={0.45} />
        </mesh>
      ))}

      {Array.from({ length: MAX_PULSES }, (_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#e8a33d" transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroScene() {
  const reducedMotion = useReducedMotion();
  const [simplified, setSimplified] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [inView, setInView] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setSimplified(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The hero is the first thing on the page — but once you've scrolled
  // past it, there's no reason to keep rendering a frame every tick.
  // "demand" mode stops the render loop entirely until it's visible
  // again, without unmounting the scene (no re-init cost on scroll-back).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={simplified ? 1 : [1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion || !inView ? "demand" : "always"}
      >
        <SignatureCurve simplified={simplified} />
      </Canvas>
    </div>
  );
}
