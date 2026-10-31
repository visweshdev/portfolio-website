"use client";

import { SCENE_READY_EVENT } from "@/lib/intro";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/gsapConfig";
import { playSound } from "@/lib/sound";
import HeroObjects, { type PointerRef } from "@/components/three/HeroObjects";
import RacingCar from "@/components/three/RacingCar";
import FinishLine from "@/components/three/FinishLine";
import { buildTrack, sampleAt, CAM_END, CAM_FOV, CAM_HEIGHT, LOOK_AHEAD, type TrackPath } from "@/components/three/trackPath";

const BG = "#080807";
const FG = "#f5f5f0";
const ACCENT = "#e8a33d";
const TRACK_HALF_WIDTH = 1.7;
const PARTICLES = 700;
const PULSE_DURATION = 1.4;
const PULSE_DISTANCE = 0.3;

/** Small seeded PRNG (mulberry32) — the particle field is the same on every visit, and setup stays pure. */
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
}

/** The racing line itself: a bright core tube inside two soft additive "glow" tubes, plus the track's edge lines. */
function TrackLine({ track, glowRef }: { track: TrackPath; glowRef: React.RefObject<THREE.MeshBasicMaterial | null> }) {
  const { core, glow, halo, edges } = useMemo(() => {
    const core = new THREE.TubeGeometry(track.curve, 900, 0.022, 6, false);
    const glow = new THREE.TubeGeometry(track.curve, 900, 0.12, 8, false);
    const halo = new THREE.TubeGeometry(track.curve, 600, 0.32, 8, false);
    const edges = [-1, 1].map((dir) => {
      const n = track.pos.length / 3;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        arr[i * 3] = track.pos[i * 3] + track.side[i * 3] * TRACK_HALF_WIDTH * dir;
        arr[i * 3 + 1] = track.pos[i * 3 + 1] - 0.05;
        arr[i * 3 + 2] = track.pos[i * 3 + 2] + track.side[i * 3 + 2] * TRACK_HALF_WIDTH * dir;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: FG, transparent: true, opacity: 0.16 }));
    });
    return { core, glow, halo, edges };
  }, [track]);

  return (
    <group>
      <mesh geometry={core}>
        <meshBasicMaterial color={FG} transparent opacity={0.75} />
      </mesh>
      <mesh geometry={glow}>
        <meshBasicMaterial
          ref={glowRef}
          color={ACCENT}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={halo}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {edges.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

/** Points of light streaming down the track like data — or a speed trail. */
function Particles({ track, count }: { track: TrackPath; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const amber = new THREE.Color(ACCENT);
    const white = new THREE.Color(FG);
    const random = seededRandom(7);
    const seeds = Array.from({ length: count }, (_, i) => {
      const c = i % 4 === 0 ? white : amber;
      colors.set([c.r, c.g, c.b], i * 3);
      return {
        u: random(),
        speed: 0.004 + random() * 0.01,
        lateral: (random() * 2 - 1) * TRACK_HALF_WIDTH * 0.9,
        lift: 0.05 + random() * 0.3,
      };
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geometry, seeds };
  }, [count]);

  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  // Soft round dot instead of GL's default hard square — up close a
  // particle reads as a blurred bokeh light rather than a pixel block.
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((_, delta) => {
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      seed.u = (seed.u + seed.speed * delta) % 1;
      sampleAt(track.pos, seed.u, p);
      sampleAt(track.side, seed.u, s);
      arr[i * 3] = p.x + s.x * seed.lateral;
      arr[i * 3 + 1] = p.y + seed.lift;
      arr[i * 3 + 2] = p.z + s.z * seed.lateral;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.07}
        map={sprite}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Timing gantries over the track — one per homepage section, placed so
 * the camera drives through each exactly as that section reaches the
 * top of the screen. They brighten as the camera approaches.
 */
function Gates({ track, gates, camU }: { track: TrackPath; gates: number[]; camU: React.RefObject<number> }) {
  const frame = useMemo(() => {
    const w = TRACK_HALF_WIDTH + 0.2;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w, -0.9, 0),
      new THREE.Vector3(-w, 1.7, 0),
      new THREE.Vector3(w, 1.7, 0),
      new THREE.Vector3(w, -0.9, 0),
    ]);
    return geo;
  }, []);
  const placed = useMemo(() => {
    const p = new THREE.Vector3();
    const ahead = new THREE.Vector3();
    return gates.map((u) => {
      sampleAt(track.pos, u, p);
      sampleAt(track.pos, Math.min(u + 0.002, 1), ahead);
      const m = new THREE.Matrix4().lookAt(p, ahead, new THREE.Vector3(0, 1, 0));
      const lineMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.2 });
      const lightMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.3 });
      return {
        u,
        position: p.clone(),
        quaternion: new THREE.Quaternion().setFromRotationMatrix(m),
        line: new THREE.Line(frame, lineMat),
        lineMat,
        lightMat,
      };
    });
  }, [gates, track, frame]);

  useFrame(() => {
    for (const g of placed) {
      // 1 when the camera is right at the gate, fading out over ~8% of the track
      const near = Math.max(0, 1 - Math.abs(g.u - camU.current) / 0.08);
      g.lineMat.opacity = 0.18 + near * 0.6;
      g.lightMat.opacity = 0.3 + near * 0.7;
    }
  });

  return (
    <group>
      {placed.map((g) => (
        <group key={g.u} position={g.position} quaternion={g.quaternion}>
          <primitive object={g.line} />
          <mesh position={[0, 1.7, 0]} material={g.lightMat}>
            <sphereGeometry args={[0.07, 10, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A bright pulse that races down the track from the camera on click. */
function Pulse({
  track,
  camU,
  trigger,
  glowRef,
}: {
  track: TrackPath;
  camU: React.RefObject<number>;
  trigger: React.RefObject<number>;
  glowRef: React.RefObject<THREE.MeshBasicMaterial | null>;
}) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const state = useRef({ seen: 0, active: false, t: 0, from: 0 });
  const p = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const st = state.current;
    if (trigger.current !== st.seen) {
      st.seen = trigger.current;
      st.active = true;
      st.t = 0;
      st.from = camU.current + 0.01;
    }
    const visible = st.active;
    if (core.current) core.current.visible = visible;
    if (halo.current) halo.current.visible = visible;
    const glow = glowRef.current;
    if (!st.active) {
      if (glow) glow.opacity += (0.1 - glow.opacity) * 0.08;
      return;
    }
    st.t += delta / PULSE_DURATION;
    if (st.t >= 1) {
      st.active = false;
      return;
    }
    const eased = 1 - Math.pow(1 - st.t, 3);
    sampleAt(track.pos, st.from + eased * PULSE_DISTANCE, p);
    core.current?.position.copy(p);
    halo.current?.position.copy(p);
    const fade = st.t < 0.8 ? 1 : (1 - st.t) / 0.2;
    (core.current?.material as THREE.MeshBasicMaterial).opacity = fade;
    (halo.current?.material as THREE.MeshBasicMaterial).opacity = fade * 0.4;
    // the whole line flares briefly as the pulse fires
    if (glow) glow.opacity = 0.1 + 0.14 * fade;
  });

  return (
    <group>
      <mesh ref={core} visible={false}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshBasicMaterial color="#fff3dc" transparent />
      </mesh>
      <mesh ref={halo} visible={false}>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshBasicMaterial color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Drives the camera along the track from scroll position, with a slight sway toward the cursor. */
function CameraRig({ track, camU, pointer }: { track: TrackPath; camU: React.RefObject<number>; pointer: PointerRef }) {
  const { camera } = useThree();
  const p = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const sway = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const target = scrollProgress() * CAM_END;
    camU.current += (target - camU.current) * 0.12;
    sway.current.x += (pointer.current.x - sway.current.x) * 0.05;
    sway.current.y += (pointer.current.y - sway.current.y) * 0.05;

    sampleAt(track.pos, camU.current, p);
    sampleAt(track.side, camU.current, side);
    sampleAt(track.pos, camU.current + LOOK_AHEAD, look);
    camera.position.set(
      p.x + side.x * sway.current.x * 0.6,
      p.y + CAM_HEIGHT - sway.current.y * 0.3,
      p.z + side.z * sway.current.x * 0.6
    );
    camera.lookAt(look.x, look.y + 0.35, look.z);
  });
  return null;
}

/** Tells the loading screen the track is on screen (after its first frame). */
function ReadySignal() {
  const sent = useRef(false);
  useFrame(() => {
    if (sent.current) return;
    sent.current = true;
    (window as unknown as { __sceneReady?: boolean }).__sceneReady = true;
    window.dispatchEvent(new Event(SCENE_READY_EVENT));
  });
  return null;
}

function Scene({ gates, gateIds, lite }: { gates: number[]; gateIds: string[]; lite: boolean }) {
  const track = useMemo(() => buildTrack(), []);
  const camU = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const pulseTrigger = useRef(0);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    }
    // Clicking empty space anywhere on the homepage fires a pulse — but
    // not when the click was meant for a link, button, photo, collage
    // piece or dialog.
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target || target.closest("a, button, input, textarea, select, [data-cursor], [role='dialog']")) return;
      pulseTrigger.current += 1;
      playSound("whoosh");
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {/* distance fade into the page colour, so the track dissolves rather than ends */}
      <fog attach="fog" args={[BG, 8, 70]} />
      {/* only the driver uses lit materials; everything else is unlit lines */}
      <hemisphereLight args={["#fff8ee", "#2a2622", 1.6]} />
      <directionalLight position={[4, 8, 6]} intensity={1.8} />
      <ReadySignal />
      <CameraRig track={track} camU={camU} pointer={pointer} />
      <TrackLine track={track} glowRef={glowRef} />
      <Particles track={track} count={lite ? 320 : PARTICLES} />
      <Gates track={track} gates={gates} camU={camU} />
      <FinishLine track={track} />
      <Pulse track={track} camU={camU} trigger={pulseTrigger} glowRef={glowRef} />
      <RacingCar track={track} camU={camU} gates={gates} gateIds={gateIds} />
      <HeroObjects track={track} pointer={pointer} />
      <gridHelper args={[400, 140, "#2a2925", "#1a1a17"]} position={[0, -1.4, -80]} />
    </>
  );
}

/**
 * The homepage's 3D layer: a racing line that the camera drives along
 * as you scroll the whole page. Rendered fixed behind all content
 * (portaled to <body> so no transformed ancestor can trap it), with
 * pointer-events off so it never blocks the page.
 *
 * Not mounted under reduced motion (see Hero.tsx). `lite` (touch
 * screens) renders at a lower pixel ratio to stay smooth on phones.
 */
export default function TrackScene({ lite = false }: { lite?: boolean }) {
  const [gates, setGates] = useState<number[]>([]);
  const [gateIds, setGateIds] = useState<string[]>([]);
  // nothing to draw while the tab is in the background
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Each homepage section after the hero gets a gantry at the point on
  // the track the camera reaches when that section hits the top of the
  // screen. Re-measured whenever ScrollTrigger recalculates layout
  // (resize, fonts, pinned sections adding scroll distance).
  useEffect(() => {
    function measure() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const sections = Array.from(document.querySelectorAll("main section")).slice(1);
      setGateIds(sections.map((s) => s.id));
      setGates(
        sections.map((s) => {
          const top = s.getBoundingClientRect().top + window.scrollY;
          return Math.min(top / max, 1) * CAM_END + 0.004;
        })
      );
    }
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("resize", measure);
    return () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas frameloop={hidden ? "never" : "always"} camera={{ position: [0, CAM_HEIGHT, 0], fov: CAM_FOV, near: 0.1, far: 120 }} dpr={lite ? [1, 1.25] : [1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: lite ? "low-power" : "high-performance" }}>
        <Scene gates={gates} gateIds={gateIds} lite={lite} />
      </Canvas>
    </div>,
    document.body
  );
}
