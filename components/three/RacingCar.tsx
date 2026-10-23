"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { F1Model } from "@/components/three/HeroObjects";
import { sampleAt, SAMPLES, type TrackPath } from "@/components/three/trackPath";
import { CAR_ON_TRACK_EVENT } from "@/lib/carEvents";

const BASE_LEAD = 0.03; // default gap ahead of the camera on the line (fraction of the track)
const MIN_LEAD = 0.015; // closest a drop can place it
const MAX_LEAD = 0.09; // furthest a drop can place it
const MAX_EXTRA_LEAD = 0.04; // how much further it can pull away when you scroll fast
const MIN_EXTRA_LEAD = -0.012; // how much closer it drops back when scrolling up
const SCALE = 0.7;
const RIDE_HEIGHT = 0.24 * SCALE; // wheel radius, so the tyres sit on the line
const PIT_OFFSET = -1.45; // beside the line at the start: negative = left of it, in the open space below the headline
const SNAP_DISTANCE = 1.4; // a drop this close to the line counts as "on the line"
const HIT_RADIUS = 1.0; // forgiving grab area around the car
const MERGE_SECONDS = 0.9;

type Mode = "parked" | "dragging" | "merging" | "racing";

/**
 * The F1 car. It starts parked beside the track, like in a pit box.
 *  - Grab it and drag it around the ground; drop it on (or near) the
 *    racing line and it snaps on, lining up with the track at that spot.
 *    Drop it elsewhere and it stays parked there.
 *  - If nobody places it, scrolling makes it pull out and merge onto the
 *    line by itself.
 *  - On the line it follows the scroll: parked when you stop, pulling
 *    away when you scroll fast, drifting tail-out through bends, and
 *    lurching forward like a throttle blip when clicked.
 *
 * The 3D layer sits behind the page with pointer events off, so grabs and
 * clicks are found by casting the cursor's ray and testing how close it
 * passes to the car (a forgiving sphere test).
 */
export default function RacingCar({ track, camU }: { track: TrackPath; camU: React.RefObject<number> }) {
  const car = useRef<THREE.Group>(null);
  const light = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();

  const v = useMemo(
    () => ({
      p: new THREE.Vector3(),
      ahead: new THREE.Vector3(),
      further: new THREE.Vector3(),
      side: new THREE.Vector3(),
      pose: new THREE.Object3D(), // the racing-line pose, computed each frame
      mergeFrom: new THREE.Vector3(),
      mergeFromQ: new THREE.Quaternion(),
    }),
    []
  );
  const st = useRef({
    mode: "parked" as Mode,
    placed: false, // parked pose set up yet?
    startCamU: 0,
    lead: BASE_LEAD,
    mergeT: 0,
    prevU: -1,
    extra: 0,
    speed: 0,
    drift: 0,
    rev: 0,
  });

  function beginMerge() {
    const g = car.current;
    const s = st.current;
    if (!g || s.mode === "merging" || s.mode === "racing") return;
    v.mergeFrom.copy(g.position);
    v.mergeFromQ.copy(g.quaternion);
    s.mergeT = 0;
    s.mode = "merging";
    window.dispatchEvent(new Event(CAR_ON_TRACK_EVENT));
  }

  // grab / drag / drop / click
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const world = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const grabOffset = new THREE.Vector3();
    const tp = new THREE.Vector3();
    let downAt: { x: number; y: number } | null = null;
    let hovering = false;

    const setRay = (e: MouseEvent) => {
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const overPageUi = (e: MouseEvent) =>
      !!(e.target as Element | null)?.closest("a, button, input, [data-cursor], [role='dialog']");
    const isOverCar = (e: MouseEvent) => {
      const g = car.current;
      if (!g || overPageUi(e)) return false;
      setRay(e);
      g.getWorldPosition(world);
      return ray.ray.distanceToPoint(world) < HIT_RADIUS;
    };
    const setCursor = (on: boolean) => {
      if (on === hovering) return;
      hovering = on;
      document.documentElement.classList.toggle("car-hover", on);
    };

    function onDown(e: MouseEvent) {
      downAt = { x: e.clientX, y: e.clientY };
      const s = st.current;
      if (s.mode !== "parked" || !isOverCar(e)) return;
      e.preventDefault(); // no text selection while dragging
      const g = car.current!;
      plane.constant = -g.position.y; // drag across the ground at the car's height
      if (ray.ray.intersectPlane(plane, hit)) grabOffset.copy(g.position).sub(hit);
      s.mode = "dragging";
      document.documentElement.classList.add("car-dragging");
    }
    function onMove(e: MouseEvent) {
      const s = st.current;
      const g = car.current;
      if (s.mode === "dragging" && g) {
        setRay(e);
        if (ray.ray.intersectPlane(plane, hit)) {
          g.position.x = hit.x + grabOffset.x;
          g.position.z = hit.z + grabOffset.z;
        }
        return;
      }
      setCursor((s.mode === "parked" || s.mode === "racing") && isOverCar(e));
    }
    function onUp() {
      const s = st.current;
      const g = car.current;
      if (s.mode !== "dragging" || !g) return;
      document.documentElement.classList.remove("car-dragging");
      // nearest point on the line ahead of the camera
      let bestU = -1;
      let bestD = Infinity;
      const from = camU.current;
      const to = Math.min(from + 0.2, 1);
      for (let u = from; u <= to; u += 2 / SAMPLES) {
        sampleAt(track.pos, u, tp);
        const d = Math.hypot(tp.x - g.position.x, tp.z - g.position.z);
        if (d < bestD) {
          bestD = d;
          bestU = u;
        }
      }
      if (bestD < SNAP_DISTANCE) {
        s.lead = THREE.MathUtils.clamp(bestU - from, MIN_LEAD, MAX_LEAD);
        beginMerge();
      } else {
        s.mode = "parked"; // stays where it was dropped; scrolling still merges it
        s.startCamU = camU.current;
      }
    }
    function onClick(e: MouseEvent) {
      const moved = downAt ? Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) : 0;
      if (st.current.mode !== "racing" || moved > 5 || !isOverCar(e)) return;
      st.current.rev = 1;
    }

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("click", onClick);
      document.documentElement.classList.remove("car-hover", "car-dragging");
    };
    // beginMerge only touches refs, so it's safe to leave out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, track, camU]);

  useFrame(({ clock }, delta) => {
    const g = car.current;
    if (!g) return;
    const s = st.current;
    const camNow = camU.current;
    if (s.prevU < 0) s.prevU = camNow;

    // camera speed along the track (fraction per second), smoothed
    const vel = (camNow - s.prevU) / Math.max(delta, 1 / 240);
    s.prevU = camNow;
    s.speed += (vel - s.speed) * 0.1;

    // first frame: park beside the line, angled toward it
    if (!s.placed) {
      const u0 = camNow + 0.025;
      sampleAt(track.pos, u0, v.p);
      sampleAt(track.side, u0, v.side);
      sampleAt(track.pos, Math.min(u0 + 0.01, 1), v.ahead);
      g.position.set(v.p.x + v.side.x * PIT_OFFSET, v.p.y + RIDE_HEIGHT, v.p.z + v.side.z * PIT_OFFSET);
      g.lookAt(v.ahead.x + v.side.x * PIT_OFFSET * 0.55, v.p.y + RIDE_HEIGHT, v.ahead.z + v.side.z * PIT_OFFSET * 0.55);
      s.placed = true;
      s.startCamU = camNow;
    }

    // not placed by hand? scrolling makes it pull out by itself
    if (s.mode === "parked" && Math.abs(camNow - s.startCamU) > 0.002) beginMerge();

    // ---- the racing-line pose (used while merging and racing) ----
    const targetExtra = THREE.MathUtils.clamp(s.speed * 0.5, MIN_EXTRA_LEAD, MAX_EXTRA_LEAD);
    s.extra += (targetExtra - s.extra) * 0.04;
    s.rev *= Math.pow(0.12, delta);
    const u = Math.min(camNow + s.lead + s.extra + s.rev * 0.012, 0.995);
    sampleAt(track.pos, u, v.p);
    sampleAt(track.pos, Math.min(u + 0.004, 1), v.ahead);
    sampleAt(track.side, u, v.side);

    // drift: how sharply the line bends just ahead × how fast you scroll
    sampleAt(track.pos, Math.min(u + 0.02, 1), v.further);
    const h1 = Math.atan2(v.ahead.x - v.p.x, v.ahead.z - v.p.z);
    const h2 = Math.atan2(v.further.x - v.ahead.x, v.further.z - v.ahead.z);
    let bend = h2 - h1;
    if (bend > Math.PI) bend -= Math.PI * 2;
    if (bend < -Math.PI) bend += Math.PI * 2;
    const pace = Math.min(Math.abs(s.speed) * 30, 1);
    const targetDrift = s.mode === "racing" ? THREE.MathUtils.clamp(bend * pace * 5, -0.6, 0.6) : 0;
    s.drift += (targetDrift - s.drift) * 0.06;

    const idle = Math.sin(clock.elapsedTime * 38) * (0.004 + s.rev * 0.02);
    const slide = -s.drift * 0.35; // body slides toward the outside of the bend
    const pose = v.pose;
    pose.position.set(v.p.x + v.side.x * slide, v.p.y + RIDE_HEIGHT + idle, v.p.z + v.side.z * slide);
    pose.lookAt(v.ahead.x + v.side.x * slide, v.ahead.y + RIDE_HEIGHT, v.ahead.z + v.side.z * slide);
    pose.rotateY(s.drift);
    pose.rotateZ(-s.drift * 0.15); // a little body roll

    if (s.mode === "merging") {
      s.mergeT = Math.min(s.mergeT + delta / MERGE_SECONDS, 1);
      const e = s.mergeT < 0.5 ? 2 * s.mergeT * s.mergeT : 1 - Math.pow(-2 * s.mergeT + 2, 2) / 2; // ease in-out
      g.position.lerpVectors(v.mergeFrom, pose.position, e);
      g.quaternion.slerpQuaternions(v.mergeFromQ, pose.quaternion, e);
      if (s.mergeT >= 1) s.mode = "racing";
    } else if (s.mode === "racing") {
      g.position.copy(pose.position);
      g.quaternion.copy(pose.quaternion);
    }

    if (light.current) {
      const moving = s.mode === "racing" ? Math.abs(s.speed) * 4 : 0;
      light.current.opacity = 0.18 + Math.min(moving + s.rev * 0.6, 0.65);
    }
  });

  return (
    <group ref={car}>
      {/* lookAt points +z down the track; the model's nose is +x */}
      <group rotation={[0, -Math.PI / 2, 0]} scale={SCALE}>
        <F1Model />
        {/* rear rain light, the way a real F1 car glows from behind */}
        <mesh position={[-1.18, 0.12, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color="#ff2a1f" toneMapped={false} />
        </mesh>
        <mesh position={[-1.18, 0.12, 0]}>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshBasicMaterial
            ref={light}
            color="#ff2a1f"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
