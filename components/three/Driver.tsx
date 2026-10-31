"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Colours taken from the reference photo: oversized white tee with a small
// print, washed grey wide-leg jeans, white sneakers, dark messy hair.
const SKIN = "#b07a52";
const TEE = "#eeece6";
const JEANS = "#8b8d90";
const SHOES = "#e6e3dc";
const HAIR = "#17110d";
const PRINT = "#c86a3a";
const LINE = "#f5f5f0";

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

/** A solid, flat-shaded part with a faint outline so it reads on the dark page. */
function Part({
  geometry,
  color,
  outline = 0.18,
  ...props
}: { geometry: THREE.BufferGeometry; color: string; outline?: number } & React.ComponentProps<"group">) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 30), [geometry]);
  return (
    <group {...props}>
      <mesh geometry={geometry}>
        {/* a little self-light so he never sinks into the dark page,
            whichever way the scene lights hit him */}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.32} flatShading roughness={0.85} />
      </mesh>
      {outline > 0 && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={LINE} transparent opacity={outline} />
        </lineSegments>
      )}
    </group>
  );
}

/**
 * A low-poly figure of Viswesh, about 1 unit tall with the feet at y = 0,
 * facing +z. Legs and arms are pivot groups (hip / shoulder) so a walk
 * cycle can swing them. `seated` drops the legs and puts the hands
 * forward on the wheel — the version that rides in the car.
 */
export function ManModel({ rig, seated = false }: { rig?: ManRig; seated?: boolean }) {
  const g = useMemo(
    () => ({
      leg: new THREE.CylinderGeometry(0.066, 0.078, 0.44, 7),
      shoe: new THREE.BoxGeometry(0.11, 0.06, 0.2),
      sole: new THREE.BoxGeometry(0.115, 0.018, 0.205),
      hips: new THREE.CylinderGeometry(0.135, 0.13, 0.1, 8),
      torso: new THREE.CylinderGeometry(0.165, 0.175, 0.36, 8),
      sleeve: new THREE.CylinderGeometry(0.062, 0.068, 0.17, 7),
      forearm: new THREE.CylinderGeometry(0.031, 0.028, 0.25, 6),
      hand: new THREE.IcosahedronGeometry(0.036, 0),
      neck: new THREE.CylinderGeometry(0.042, 0.046, 0.07, 6),
      head: new THREE.IcosahedronGeometry(0.085, 1),
      hair: new THREE.IcosahedronGeometry(0.097, 1),
      fringe: new THREE.IcosahedronGeometry(0.05, 0),
      print: new THREE.PlaneGeometry(0.09, 0.065),
      eye: new THREE.SphereGeometry(0.0085, 8, 6),
      brow: new THREE.BoxGeometry(0.03, 0.007, 0.006),
      stache: new THREE.BoxGeometry(0.046, 0.009, 0.008),
    }),
    []
  );
  const set = (key: keyof ManRig) => (el: THREE.Group | null) => {
    if (rig) rig[key] = el;
  };

  const arm = (side: 1 | -1) => (
    <group
      ref={set(side === 1 ? "lArm" : "rArm")}
      position={[0.19 * side, 0.86, 0]}
      rotation={seated ? [-1.1, 0, 0.12 * side] : [0, 0, 0.08 * side]}
    >
      <Part geometry={g.sleeve} color={TEE} position={[0, -0.07, 0]} />
      <Part geometry={g.forearm} color={SKIN} position={[0, -0.27, 0]} outline={0.08} />
      <Part geometry={g.hand} color={SKIN} position={[0, -0.41, 0]} outline={0} />
    </group>
  );

  const leg = (side: 1 | -1) => (
    <group ref={set(side === 1 ? "lLeg" : "rLeg")} position={[0.072 * side, 0.5, 0]}>
      <Part geometry={g.leg} color={JEANS} position={[0, -0.22, 0]} />
      <Part geometry={g.shoe} color={SHOES} position={[0, -0.455, 0.035]} />
      <Part geometry={g.sole} color="#bdb9b0" position={[0, -0.482, 0.035]} outline={0} />
    </group>
  );

  return (
    <group ref={set("body")}>
      {!seated && leg(1)}
      {!seated && leg(-1)}
      <Part geometry={g.hips} color={JEANS} position={[0, 0.52, 0]} scale={[1, 1, 0.68]} />
      <group scale={[1, 1, 0.62]}>
        <Part geometry={g.torso} color={TEE} position={[0, 0.74, 0]} />
      </group>
      {/* the small painted print on the chest */}
      <mesh geometry={g.print} position={[0, 0.79, 0.111]}>
        <meshBasicMaterial color={PRINT} />
      </mesh>
      {arm(1)}
      {arm(-1)}
      <Part geometry={g.neck} color={SKIN} position={[0, 0.94, 0]} outline={0} />
      <group ref={set("head")} position={[0, 1.02, 0]}>
        <Part geometry={g.head} color={SKIN} scale={[0.92, 1.08, 0.98]} outline={0.1} />
        {/* face: eyes, brows, the moustache */}
        {[-1, 1].map((x) => (
          <group key={x}>
            <mesh geometry={g.eye} position={[0.029 * x, 0.008, 0.076]}>
              <meshBasicMaterial color="#120c08" />
            </mesh>
            <mesh geometry={g.brow} position={[0.03 * x, 0.03, 0.074]} rotation={[0, 0, -0.12 * x]}>
              <meshBasicMaterial color={HAIR} />
            </mesh>
          </group>
        ))}
        <mesh geometry={g.stache} position={[0, -0.034, 0.078]}>
          <meshBasicMaterial color={HAIR} />
        </mesh>
        <Part geometry={g.hair} color={HAIR} position={[0, 0.045, -0.012]} scale={[1, 0.72, 1.04]} outline={0.3} />
        <Part geometry={g.fringe} color={HAIR} position={[0.035, 0.06, 0.06]} scale={[1.3, 0.6, 1]} outline={0.25} />
        <Part geometry={g.fringe} color={HAIR} position={[-0.04, 0.055, 0.055]} scale={[1.1, 0.55, 1]} outline={0.25} />
      </group>
    </group>
  );
}
