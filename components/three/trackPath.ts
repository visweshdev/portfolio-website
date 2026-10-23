import * as THREE from "three";

/** Samples in the precomputed lookup table — per-frame work reads these instead of re-evaluating the spline. */
export const SAMPLES = 2048;
/** The camera stops short of the end, so there is always track ahead of it. */
export const CAM_END = 0.9;
/** How far ahead (as a fraction of the track) the camera looks. */
export const LOOK_AHEAD = 0.022;
/** Camera height above the racing line. */
export const CAM_HEIGHT = 1.15;
/** Vertical field of view of the track camera, in degrees. */
export const CAM_FOV = 55;

/** Places a camera at the very start of the track, exactly as the scroll-driven rig does at scroll 0. */
export function startCamera(track: TrackPath, aspect: number) {
  const cam = new THREE.PerspectiveCamera(CAM_FOV, aspect, 0.1, 120);
  const p = sampleAt(track.pos, 0, new THREE.Vector3());
  const look = sampleAt(track.pos, LOOK_AHEAD, new THREE.Vector3());
  cam.position.set(p.x, p.y + CAM_HEIGHT, p.z);
  cam.lookAt(look.x, look.y + 0.35, look.z);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

export type TrackPath = {
  curve: THREE.CatmullRomCurve3;
  /** xyz of evenly spaced points along the track. */
  pos: Float32Array;
  /** xyz of the unit "sideways" vector at each point (tangent × up). */
  side: Float32Array;
};

/**
 * The racing line the homepage camera drives along: a long, gently
 * banking S-curve heading into the screen (−z). Deterministic, so the
 * same track renders on every visit.
 */
export function buildTrack(): TrackPath {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const z = -i * 11;
    const x = i === 0 ? 0 : Math.sin(i * 1.15) * 4.2 + Math.sin(i * 0.41) * 2.2;
    const y = Math.sin(i * 0.63) * 0.7;
    points.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);

  const pos = new Float32Array((SAMPLES + 1) * 3);
  const side = new Float32Array((SAMPLES + 1) * 3);
  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const s = new THREE.Vector3();
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    s.crossVectors(t, up).normalize();
    pos.set([p.x, p.y, p.z], i * 3);
    side.set([s.x, s.y, s.z], i * 3);
  }
  return { curve, pos, side };
}

/** Reads the lookup table at u ∈ [0, 1] (linear between samples) into `out`. */
export function sampleAt(table: Float32Array, u: number, out: THREE.Vector3) {
  const f = Math.min(Math.max(u, 0), 1) * SAMPLES;
  const i = Math.min(Math.floor(f), SAMPLES - 1);
  const k = f - i;
  const a = i * 3;
  const b = a + 3;
  return out.set(
    table[a] + (table[b] - table[a]) * k,
    table[a + 1] + (table[b + 1] - table[a + 1]) * k,
    table[a + 2] + (table[b + 2] - table[a + 2]) * k
  );
}
