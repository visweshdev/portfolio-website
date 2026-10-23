"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { sampleAt, CAM_END, type TrackPath } from "@/components/three/trackPath";

// Where the car sits when the page is scrolled all the way down: the
// camera stops at CAM_END and the car rides ~0.03 ahead (RacingCar.tsx).
// The line goes just in front of that, so reaching the bottom of the
// site means the car crossing it.
const FINISH_U = CAM_END + 0.034;
const WIDTH = 3.8; // across the track (edge lines sit at ±1.7)
const DEPTH = 0.7; // along the track
const ROWS = 2;

/** A chequered finish line painted across the track at the end of the page. */
export default function FinishLine({ track }: { track: TrackPath }) {
  const { position, quaternion, texture } = useMemo(() => {
    const p = sampleAt(track.pos, FINISH_U, new THREE.Vector3());
    const ahead = sampleAt(track.pos, FINISH_U + 0.002, new THREE.Vector3());
    // lay the plane flat on the track, its length running across it
    const m = new THREE.Matrix4().lookAt(p, ahead, new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));

    // chequer pattern drawn once into a small canvas
    const cols = Math.round((WIDTH / DEPTH) * ROWS);
    const cell = 16;
    const c = document.createElement("canvas");
    c.width = cols * cell;
    c.height = ROWS * cell;
    const ctx = c.getContext("2d")!;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#f5f5f0" : "#080807";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return { position: new THREE.Vector3(p.x, p.y + 0.01, p.z), quaternion: q, texture: t };
  }, [track]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <planeGeometry args={[WIDTH, DEPTH]} />
      <meshBasicMaterial map={texture} transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}
