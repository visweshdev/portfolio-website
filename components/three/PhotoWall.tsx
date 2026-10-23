"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Photo } from "@/data/photography";
import { playSound } from "@/lib/sound";

const RADIUS = 7;
const SPACING = 0.5; // radians between neighbouring photos
const FRAME_W = 2.3;
const FRAME_H = 2.85;
const PHOTO_W = 2.05;
const PHOTO_H = 2.5;
const PAPER = "#ece5d4";

/** A small, resized copy from Next's image optimizer — the 3D wall never needs the full-size file. */
function textureUrl(src: string) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;
}

type DragState = { down: boolean; startX: number; lastX: number; moved: number; velocity: number };

function Polaroid({
  photo,
  texture,
  index,
  count,
  hovered,
  setHovered,
  drag,
  onOpen,
}: {
  photo: Photo;
  texture: THREE.Texture;
  index: number;
  count: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  drag: React.RefObject<DragState>;
  onOpen: (photo: Photo) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const angle = (index - (count - 1) / 2) * SPACING;
  const baseY = index % 2 === 0 ? -0.25 : 0.35;

  // A cover-fitted copy of the photo for its 4:5 window, like object-fit: cover.
  const map = useMemo(() => {
    const t = texture.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    const img = t.image as { width: number; height: number } | undefined;
    if (img) {
      const imgAspect = img.width / img.height;
      const boxAspect = PHOTO_W / PHOTO_H;
      if (imgAspect > boxAspect) {
        t.repeat.set(boxAspect / imgAspect, 1);
        t.offset.set((1 - boxAspect / imgAspect) / 2, 0);
      } else {
        t.repeat.set(1, imgAspect / boxAspect);
        t.offset.set(0, (1 - imgAspect / boxAspect) / 2);
      }
    }
    t.needsUpdate = true;
    return t;
  }, [texture]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const isHovered = hovered === index;
    const t = clock.elapsedTime;
    const pull = isHovered ? 0.6 : 0; // hovered photo leans out toward you
    const r = RADIUS - pull;
    g.position.x += (Math.sin(angle) * r - g.position.x) * 0.12;
    g.position.z += (-Math.cos(angle) * r - g.position.z) * 0.12;
    g.position.y = baseY + Math.sin(t * 0.7 + index) * 0.06;
    const s = THREE.MathUtils.lerp(g.scale.x, isHovered ? 1.06 : 1, 0.12);
    g.scale.setScalar(s);
  });

  return (
    <group
      ref={group}
      position={[Math.sin(angle) * RADIUS, baseY, -Math.cos(angle) * RADIUS]}
      rotation={[0, -angle, THREE.MathUtils.degToRad(photo.rotation)]}
    >
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(index);
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation();
          // a drag that happened to end on a photo isn't a click
          if (drag.current.moved > 6) return;
          playSound("pop");
          onOpen(photo);
        }}
      >
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial color={PAPER} />
      </mesh>
      <mesh position={[0, 0.12, 0.01]}>
        <planeGeometry args={[PHOTO_W, PHOTO_H]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Wall({
  photos,
  drag,
  yaw,
  onOpen,
}: {
  photos: Photo[];
  drag: React.RefObject<DragState>;
  yaw: React.RefObject<number>;
  onOpen: (p: Photo) => void;
}) {
  const textures = useLoader(
    THREE.TextureLoader,
    photos.map((p) => textureUrl(p.src as string))
  );
  const [hovered, setHovered] = useState<number | null>(null);
  const { camera } = useThree();
  const limit = ((photos.length - 1) / 2) * SPACING;

  useFrame(({ clock }, delta) => {
    const d = drag.current;
    if (!d.down) {
      // inertia after release, then a slow idle drift
      yaw.current += d.velocity;
      d.velocity *= Math.pow(0.9, delta * 60);
      if (Math.abs(d.velocity) < 0.0001 && hovered === null) {
        yaw.current += Math.sin(clock.elapsedTime * 0.25) * 0.0008;
      }
    }
    yaw.current = THREE.MathUtils.clamp(yaw.current, -limit, limit);
    camera.rotation.set(0, -yaw.current, 0);
  });

  return (
    <>
      {photos.map((photo, i) => (
        <Polaroid
          key={photo.id}
          photo={photo}
          texture={textures[i]}
          index={i}
          count={photos.length}
          hovered={hovered}
          setHovered={setHovered}
          drag={drag}
          onOpen={onOpen}
        />
      ))}
    </>
  );
}

/**
 * The photographs hung in a curved wall in 3D space. Drag sideways to
 * look along it (it carries on with a little inertia); hover lifts a
 * print toward you; click opens it in the same lightbox as the grid.
 * Rendering pauses while it's scrolled out of view.
 *
 * Decorative duplicate of the grid below, which stays the accessible,
 * keyboard-friendly way to browse — hence aria-hidden.
 */
export default function PhotoWall({ photos, onOpen }: { photos: Photo[]; onOpen: (p: Photo) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const drag = useRef<DragState>({ down: false, startX: 0, lastX: 0, moved: 0, velocity: 0 });
  const yaw = useRef(0);
  const withImages = photos.filter((p) => p.src);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    drag.current.down = true;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.moved = 0;
    drag.current.velocity = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.startX));
    // Capture only once this is clearly a drag (so it keeps tracking
    // outside the box). Capturing on press would steal the release from
    // the canvas, and a plain click on a print would never register.
    const el = e.currentTarget as HTMLElement;
    if (d.moved > 6 && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
    const step = dx * 0.004;
    yaw.current -= step;
    d.velocity = -step;
  }
  function onPointerUp() {
    drag.current.down = false;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      data-cursor="drag"
      className="relative h-full w-full select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 50, near: 0.1, far: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop={inView ? "always" : "demand"}
      >
        <Suspense fallback={null}>
          <Wall photos={withImages} drag={drag} yaw={yaw} onOpen={onOpen} />
        </Suspense>
      </Canvas>
    </div>
  );
}
