"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Colours taken from the reference photo: oversized white tee with a small
// print, washed grey wide-leg jeans, white sneakers, dark messy hair.
const SKIN = "#b07a52";
const TEE = "#eeece6";
const JEANS = "#8b8d90";
const SHOES = "#e6e3dc";
const HAIR = "#2a1f18";
const PRINT = "#c86a3a";

/** The limbs a walk cycle moves. Filled in by ManModel via callback refs. */
export type ManRig = {
  body: THREE.Group | null;
  lLeg: THREE.Group | null;
  rLeg: THREE.Group | null;
  lArm: THREE.Group | null;
  rArm: THREE.Group | null;
  head: THREE.Group | null;
};

export function emptyRig(): ManRig {
  return { body: null, lLeg: null, rLeg: null, lArm: null, rArm: null, head: null };
}

/** A smooth part with a little self-light so it never sinks into the dark page. */
function Part({
  geometry,
  color,
  glow = 0.28,
  ...props
}: { geometry: THREE.BufferGeometry; color: string; glow?: number } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Oversized tee: wider at the shoulders, rounding over into the neckline. */
function teeGeometry() {
  const profile = [
    [0, 0], [0.16, 0], [0.163, 0.02], [0.152, 0.12], [0.158, 0.24],
    [0.165, 0.3], [0.156, 0.345], [0.115, 0.372], [0.058, 0.385], [0, 0.388],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 28);
}

// Fixed clumps so the hair looks messy but the same every time.
const HAIR_CLUMPS: [number, number, number, number][] = [
  [0.04, 0.085, 0.04, 0.042], [-0.03, 0.092, 0.045, 0.04], [0, 0.102, 0, 0.045],
  [0.062, 0.06, -0.02, 0.038], [-0.062, 0.064, -0.012, 0.038], [0.022, 0.07, 0.07, 0.034],
  [-0.045, 0.058, 0.064, 0.032], [0, 0.07, -0.07, 0.042], [0.05, 0.09, -0.04, 0.034],
];

/**
 * A stylised figure of Viswesh, about 1 unit tall with the feet at y = 0,
 * facing +z. Legs and arms are pivot groups (hip / shoulder) so a walk
 * cycle can swing them. `seated` drops the legs and puts the hands
 * forward on the wheel — the version that rides in the car.
 */
export function ManModel({ rig, seated = false }: { rig?: ManRig; seated?: boolean }) {
  const g = useMemo(
    () => ({
      // wide-leg jeans: a touch wider at the hem
      leg: new THREE.CylinderGeometry(0.066, 0.08, 0.44, 18),
      shoe: new THREE.CapsuleGeometry(0.048, 0.11, 6, 14),
      sole: new THREE.CapsuleGeometry(0.052, 0.112, 4, 14),
      hips: new THREE.CylinderGeometry(0.15, 0.142, 0.1, 20),
      tee: teeGeometry(),
      shoulder: new THREE.SphereGeometry(0.058, 16, 12),
      sleeve: new THREE.CylinderGeometry(0.056, 0.064, 0.15, 16, 1, true),
      forearm: new THREE.CapsuleGeometry(0.034, 0.2, 4, 12),
      hand: new THREE.SphereGeometry(0.04, 14, 10),
      neck: new THREE.CylinderGeometry(0.04, 0.046, 0.08, 14),
      head: new THREE.SphereGeometry(0.085, 28, 20),
      ear: new THREE.SphereGeometry(0.018, 10, 8),
      nose: new THREE.SphereGeometry(0.012, 10, 8),
      hairCap: new THREE.SphereGeometry(0.092, 24, 16),
      clump: new THREE.SphereGeometry(1, 12, 9),
      print: new THREE.PlaneGeometry(0.07, 0.05),
      eye: new THREE.SphereGeometry(0.0085, 10, 8),
      brow: new THREE.CapsuleGeometry(0.004, 0.026, 2, 6),
      stache: new THREE.CapsuleGeometry(0.0055, 0.04, 2, 8),
    }),
    []
  );
  const set = (key: keyof ManRig) => (el: THREE.Group | null) => {
    if (rig) rig[key] = el;
  };

  const arm = (side: 1 | -1) => (
    <group
      ref={set(side === 1 ? "lArm" : "rArm")}
      position={[0.172 * side, 0.865, 0]}
      rotation={seated ? [-1.1, 0, 0.12 * side] : [0, 0, 0.08 * side]}
    >
      <Part geometry={g.shoulder} color={TEE} position={[-0.012 * side, 0.004, 0]} scale={[1, 0.9, 0.85]} />
      <Part geometry={g.sleeve} color={TEE} position={[0, -0.07, 0]} />
      <Part geometry={g.forearm} color={SKIN} position={[0, -0.27, 0]} />
      <Part geometry={g.hand} color={SKIN} position={[0, -0.415, 0.004]} scale={[0.9, 1.15, 0.8]} />
    </group>
  );

  const leg = (side: 1 | -1) => (
    <group ref={set(side === 1 ? "lLeg" : "rLeg")} position={[0.072 * side, 0.5, 0]}>
      <Part geometry={g.leg} color={JEANS} position={[0, -0.22, 0]} />
      {/* rounded sneaker on a slightly bigger sole */}
      <Part geometry={g.shoe} color={SHOES} position={[0, -0.448, 0.035]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1, 0.68]} />
      <Part geometry={g.sole} color="#bdb9b0" position={[0, -0.474, 0.035]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1, 0.22]} glow={0.2} />
    </group>
  );

  return (
    <group ref={set("body")}>
      {!seated && leg(1)}
      {!seated && leg(-1)}
      <Part geometry={g.hips} color={JEANS} position={[0, 0.535, 0]} scale={[1, 1, 0.66]} />
      <Part geometry={g.tee} color={TEE} position={[0, 0.55, 0]} scale={[1, 1, 0.62]} />
      {/* the small painted print on the chest */}
      <mesh geometry={g.print} position={[0, 0.8, 0.105]}>
        <meshBasicMaterial color={PRINT} />
      </mesh>
      {arm(1)}
      {arm(-1)}
      <Part geometry={g.neck} color={SKIN} position={[0, 0.95, 0]} />
      <group ref={set("head")} position={[0, 1.03, 0]} scale={1.1}>
        <Part geometry={g.head} color={SKIN} scale={[0.9, 1.08, 0.96]} />
        {[-1, 1].map((x) => (
          <group key={x}>
            <Part geometry={g.ear} color={SKIN} position={[0.077 * x, 0, -0.004]} scale={[0.55, 1, 0.8]} />
            <mesh geometry={g.eye} position={[0.029 * x, 0.008, 0.076]}>
              <meshBasicMaterial color="#120c08" />
            </mesh>
            <mesh geometry={g.brow} position={[0.03 * x, 0.03, 0.072]} rotation={[0, 0, Math.PI / 2 - 0.12 * x]}>
              <meshBasicMaterial color={HAIR} />
            </mesh>
          </group>
        ))}
        <Part geometry={g.nose} color={SKIN} position={[0, -0.01, 0.083]} scale={[0.8, 1, 0.9]} />
        <mesh geometry={g.stache} position={[0, -0.034, 0.077]} rotation={[0, 0, Math.PI / 2]}>
          <meshBasicMaterial color={HAIR} />
        </mesh>
        {/* messy dark hair: a cap plus a few clumps on top and at the front */}
        <Part geometry={g.hairCap} color={HAIR} position={[0, 0.035, -0.012]} scale={[1, 0.7, 1.05]} glow={0.4} />
        {HAIR_CLUMPS.map(([x, y, z, r], i) => (
          <Part key={i} geometry={g.clump} color={HAIR} position={[x, y, z]} scale={[r * 1.2, r * 0.75, r]} glow={0.4} />
        ))}
      </group>
    </group>
  );
}
