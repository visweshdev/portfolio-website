"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { startCamera, type TrackPath } from "@/components/three/trackPath";
import { playSound } from "@/lib/sound";

const FG = "#f5f5f0";
const ACCENT = "#e8a33d";

export type PointerRef = React.RefObject<{ x: number; y: number }>;

/** Outline-only rendering of a geometry — matches the site's thin line-icon style. */
function Outline({
  geometry,
  color = FG,
  opacity = 0.6,
  ...props
}: { geometry: THREE.BufferGeometry; color?: string; opacity?: number } & React.ComponentProps<"group">) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 20), [geometry]);
  return (
    <group {...props}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}

/**
 * Floats gently and turns to look toward the cursor — the "physical
 * object on a desk" feel of the old flat icons, now with depth.
 */
// Which floaters the cursor is over right now — drives the cursor dot's
// "interactive" state (html.hero-object-hover in globals.css).
const hoveredFloaters = new Set<string>();
function syncCursorHover() {
  document.documentElement.classList.toggle("hero-object-hover", hoveredFloaters.size > 0);
}

/**
 * Floats gently and turns to look toward the cursor — the "physical
 * object on a desk" feel of the old flat icons, now with depth — and
 * reacts to the mouse: hovering swells it, lifts it toward you and lights
 * an amber glow behind it; clicking spins it round with a flash and a pop.
 *
 * The 3D layer sits behind the page with pointer events off, so hits are
 * found by casting the cursor's ray into the scene and checking how
 * close it passes to this object (a sphere test — cheap, and forgiving
 * on thin wireframes that would be hard to hit exactly).
 */
function Floater({
  id,
  pointer,
  position,
  phase,
  baseYaw = 0,
  scale = 1,
  children,
}: {
  id: string;
  pointer: PointerRef;
  position: [number, number, number];
  phase: number;
  baseYaw?: number;
  scale?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const state = useRef({ hover: 0, isHovered: false, spin: 0, spinVel: 0, flash: 0 });

  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const world = new THREE.Vector3();
    const radius = 0.85 * scale; // forgiving hit area around the model

    function isUnder(e: MouseEvent) {
      const g = ref.current;
      if (!g) return false;
      // ignore the cursor while it's over real page UI (nav, links, cards)
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, [data-cursor], [role='dialog']")) return false;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      g.getWorldPosition(world);
      return ray.ray.distanceToPoint(world) < radius;
    }
    function onMove(e: MouseEvent) {
      const over = isUnder(e);
      if (over === state.current.isHovered) return;
      state.current.isHovered = over;
      if (over) hoveredFloaters.add(id);
      else hoveredFloaters.delete(id);
      syncCursorHover();
    }
    function onClick(e: MouseEvent) {
      if (!isUnder(e)) return;
      state.current.spinVel += 14; // rad/s — about a turn and a half
      state.current.flash = 1;
      playSound("pop");
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      hoveredFloaters.delete(id);
      syncCursorHover();
    };
  }, [camera, id, scale]);

  useFrame(({ clock }, delta) => {
    const g = ref.current;
    if (!g) return;
    const st = state.current;
    const t = clock.elapsedTime;
    st.hover += ((st.isHovered ? 1 : 0) - st.hover) * 0.12;
    st.spin += st.spinVel * delta;
    st.spinVel *= Math.pow(0.15, delta); // spin dies away over ~a second
    st.spin *= Math.pow(0.35, delta); // …and the model eases back to facing you
    st.flash *= Math.pow(0.02, delta);

    g.position.x = position[0];
    g.position.y = position[1] + Math.sin(t * 0.8 + phase) * 0.15 + st.hover * 0.15;
    g.position.z = position[2] + st.hover * 0.6; // lifts toward the camera
    g.scale.setScalar(scale * (1 + st.hover * 0.18 + st.flash * 0.15));
    const targetY = baseYaw + pointer.current.x * 0.7 + st.spin;
    const targetX = pointer.current.y * 0.4;
    g.rotation.y += (targetY - g.rotation.y) * 0.08;
    g.rotation.x += (targetX - g.rotation.x) * 0.05;
    if (glow.current) glow.current.opacity = st.hover * 0.12 + st.flash * 0.35;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {children}
      {/* amber glow behind the model on hover / click */}
      <mesh position={[0, 0, -0.3]}>
        <sphereGeometry args={[0.95, 16, 16]} />
        <meshBasicMaterial
          ref={glow}
          color={ACCENT}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function CameraModel() {
  const geo = useMemo(
    () => ({
      body: new THREE.BoxGeometry(1.1, 0.72, 0.42),
      lens: new THREE.CylinderGeometry(0.26, 0.3, 0.36, 18),
      ring: new THREE.CylinderGeometry(0.16, 0.16, 0.06, 18),
      finder: new THREE.BoxGeometry(0.36, 0.18, 0.3),
      shutter: new THREE.CylinderGeometry(0.07, 0.07, 0.07, 10),
    }),
    []
  );
  return (
    <group>
      <Outline geometry={geo.body} />
      <Outline geometry={geo.lens} position={[0, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]} />
      <Outline geometry={geo.ring} color={ACCENT} opacity={0.9} position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]} />
      <Outline geometry={geo.finder} position={[-0.2, 0.45, 0]} />
      <Outline geometry={geo.shutter} color={ACCENT} opacity={0.9} position={[0.36, 0.4, 0]} />
    </group>
  );
}

/** Wireframe F1 car, nose along +x. Drives the track in RacingCar.tsx. */
export function F1Model() {
  const geo = useMemo(
    () => ({
      chassis: new THREE.BoxGeometry(2.1, 0.16, 0.44),
      nose: new THREE.CylinderGeometry(0.03, 0.17, 0.9, 8),
      frontWing: new THREE.BoxGeometry(0.2, 0.04, 1.25),
      rearWing: new THREE.BoxGeometry(0.18, 0.06, 1.0),
      post: new THREE.BoxGeometry(0.05, 0.36, 0.05),
      airbox: new THREE.BoxGeometry(0.6, 0.26, 0.3),
      halo: new THREE.TorusGeometry(0.17, 0.018, 6, 14, Math.PI),
      wheel: new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16),
    }),
    []
  );
  const wheels: [number, number, number][] = [
    [0.72, -0.02, 0.4],
    [0.72, -0.02, -0.4],
    [-0.78, -0.02, 0.42],
    [-0.78, -0.02, -0.42],
  ];
  return (
    <group>
      <Outline geometry={geo.chassis} />
      <Outline geometry={geo.nose} position={[1.48, -0.02, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <Outline geometry={geo.frontWing} color={ACCENT} opacity={0.9} position={[1.85, -0.08, 0]} />
      <Outline geometry={geo.airbox} position={[-0.35, 0.2, 0]} />
      <Outline geometry={geo.halo} position={[0.2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Outline geometry={geo.rearWing} color={ACCENT} opacity={0.9} position={[-1.05, 0.42, 0]} />
      <Outline geometry={geo.post} position={[-1.05, 0.22, 0.25]} />
      <Outline geometry={geo.post} position={[-1.05, 0.22, -0.25]} />
      {wheels.map((p, i) => (
        <Outline key={i} geometry={geo.wheel} position={p} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}

/** "</>" built from thin solid strokes. */
function CodeModel() {
  const strokes = useMemo(() => {
    const segs: [THREE.Vector2, THREE.Vector2][] = [
      [new THREE.Vector2(-0.55, 0.5), new THREE.Vector2(-1.05, 0)],
      [new THREE.Vector2(-1.05, 0), new THREE.Vector2(-0.55, -0.5)],
      [new THREE.Vector2(-0.18, -0.62), new THREE.Vector2(0.18, 0.62)],
      [new THREE.Vector2(0.55, 0.5), new THREE.Vector2(1.05, 0)],
      [new THREE.Vector2(1.05, 0), new THREE.Vector2(0.55, -0.5)],
    ];
    return segs.map(([a, b]) => {
      const len = a.distanceTo(b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const angle = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
      return { len, mid, angle };
    });
  }, []);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.045, 0.045, 1, 8), []);
  return (
    <group>
      {strokes.map((s, i) => (
        <mesh key={i} geometry={geo} position={[s.mid.x, s.mid.y, 0]} rotation={[0, 0, s.angle]} scale={[1, s.len, 1]}>
          <meshBasicMaterial color={i === 2 ? ACCENT : FG} transparent opacity={i === 2 ? 0.9 : 0.6} />
        </mesh>
      ))}
    </group>
  );
}

function NodeModel() {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.6, 0), []);
  const core = useMemo(() => new THREE.SphereGeometry(0.1, 12, 12), []);
  return (
    <group>
      <Outline geometry={geo} />
      <mesh geometry={core}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Where each object sits on screen at scroll 0, in normalised device
 * coordinates (−1…1, y up), plus its distance from the camera. Chosen to
 * stay clear of the hero's headline (left/centre) and metadata rows
 * (top and bottom edges), whatever the window's aspect ratio.
 */
/** Three stacked disks — a database / vector store — with a glowing core. */
function DatabaseModel() {
  const disk = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.28, 20), []);
  const core = useMemo(() => new THREE.SphereGeometry(0.09, 12, 12), []);
  return (
    <group>
      {[-0.34, 0, 0.34].map((y) => (
        <Outline key={y} geometry={disk} position={[0, y, 0]} />
      ))}
      <mesh geometry={core} position={[0, 0, 0.6]}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/** A processor: square package, pins on all four sides, amber die in the middle. */
function ChipModel() {
  const pkg = useMemo(() => new THREE.BoxGeometry(1, 1, 0.14), []);
  const die = useMemo(() => new THREE.BoxGeometry(0.42, 0.42, 0.06), []);
  const pin = useMemo(() => new THREE.BoxGeometry(0.06, 0.2, 0.04), []);
  const pins: { pos: [number, number, number]; rot: number }[] = [];
  for (const o of [-0.3, -0.1, 0.1, 0.3]) {
    pins.push({ pos: [o, 0.6, 0], rot: 0 }, { pos: [o, -0.6, 0], rot: 0 });
    pins.push({ pos: [0.6, o, 0], rot: Math.PI / 2 }, { pos: [-0.6, o, 0], rot: Math.PI / 2 });
  }
  return (
    <group>
      <Outline geometry={pkg} />
      <mesh geometry={die} position={[0, 0, 0.09]}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.85} />
      </mesh>
      {pins.map((p, i) => (
        <Outline key={i} geometry={pin} position={p.pos} rotation={[0, 0, p.rot]} opacity={0.5} />
      ))}
    </group>
  );
}

const ANCHORS = {
  code: { x: 0.56, y: 0.4, dist: 9 },
  node: { x: 0.8, y: -0.02, dist: 11 },
  camera: { x: -0.5, y: -0.44, dist: 8 },
  database: { x: 0.58, y: -0.5, dist: 9 },
  chip: { x: 0.68, y: 0.3, dist: 12 },
};

/**
 * One 3D object per pillar (photography, code, AI networks, data, AI
 * hardware) — motorsport is the
 * car actually racing down the track (RacingCar.tsx) — standing beside
 * the start of the track — they replace the hero's flat
 * floating icons when the 3D scene is running, and slide past as the
 * camera sets off down the track.
 */
/**
 * The camera model sits just under the headline's left edge. The headline
 * grows with the window's width, so on very wide screens a fixed spot
 * would land on the text: measure where it actually ends instead.
 */
function cameraAnchor(w: number, h: number) {
  const r = document.querySelector("h1")?.getBoundingClientRect();
  if (!r || w <= 0 || h <= 0) return ANCHORS.camera;
  const bottom = r.bottom + window.scrollY; // the hero is at the top of the page
  return {
    x: Math.min(((r.left + 140) / w) * 2 - 1, ANCHORS.camera.x),
    y: Math.max(Math.min(1 - (2 * bottom) / h - 0.24, ANCHORS.camera.y), -0.8),
    dist: ANCHORS.camera.dist,
  };
}

export default function HeroObjects({ track, pointer }: { track: TrackPath; pointer: PointerRef }) {
  const { size } = useThree();

  // Project each screen anchor out into the world from the starting camera.
  const at = useMemo(() => {
    const cam = startCamera(track, size.width / Math.max(size.height, 1));
    const place = ({ x, y, dist }: { x: number; y: number; dist: number }): [number, number, number] => {
      const dir = new THREE.Vector3(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
      const p = cam.position.clone().addScaledVector(dir, dist);
      return [p.x, p.y, p.z];
    };
    return {
      code: place(ANCHORS.code),
      node: place(ANCHORS.node),
      camera: place(cameraAnchor(size.width, size.height)),
      database: place(ANCHORS.database),
      chip: place(ANCHORS.chip),
    };
  }, [track, size.width, size.height]);

  // On narrow or tall windows the headline fills the width — there's no
  // free space beside it, so the models would sit on top of the text.
  if (size.width < 900 || size.width / Math.max(size.height, 1) < 1.2) return null;

  return (
    <group>
      <Floater id="camera" pointer={pointer} position={at.camera} phase={0} baseYaw={0.5} scale={0.9}>
        <CameraModel />
      </Floater>
      <Floater id="code" pointer={pointer} position={at.code} phase={1.3} baseYaw={-0.3} scale={0.85}>
        <CodeModel />
      </Floater>
      <Floater id="node" pointer={pointer} position={at.node} phase={0.7} scale={0.9}>
        <NodeModel />
      </Floater>
      <Floater id="database" pointer={pointer} position={at.database} phase={2.4} baseYaw={-0.4} scale={0.85}>
        <DatabaseModel />
      </Floater>
      <Floater id="chip" pointer={pointer} position={at.chip} phase={1.8} baseYaw={-0.5} scale={0.75}>
        <ChipModel />
      </Floater>
    </group>
  );
}
