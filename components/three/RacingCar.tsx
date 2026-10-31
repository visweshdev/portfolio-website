"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { F1Model } from "@/components/three/HeroObjects";
import { ManModel, emptyRig } from "@/components/three/Driver";
import { sampleAt, CAM_END, type TrackPath } from "@/components/three/trackPath";
import { FINISH_U } from "@/components/three/FinishLine";
import { playSound } from "@/lib/sound";
import { CAR_ON_TRACK_EVENT, DRIVER_GO_EVENT } from "@/lib/carEvents";
import { INTRO_DONE_EVENT } from "@/lib/intro";

const BASE_LEAD = 0.03; // gap ahead of the camera on the line (fraction of the track)
const MAX_EXTRA_LEAD = 0.04; // how much further it can pull away when you scroll fast
const MIN_EXTRA_LEAD = -0.012; // how much closer it drops back when scrolling up
const SCALE = 0.7;
const RIDE_HEIGHT = 0.24 * SCALE; // wheel radius, so the tyres sit on the line
const MERGE_SECONDS = 0.9;

const MAN_SCALE = 0.6;
const MAN_SIDE = 1.25; // where he waits, beside the line (positive = right of it, clear of the headline)
const MAN_SIDE_NARROW = 0.72; // same, on portrait phone screens
const WALK_SPEED = 0.75; // world units per second
const RUN_SPEED = 2.2; // when you scroll before clicking him
const BOARD_SIDE = 0.5; // where he stops beside the cockpit (car-local x)
const HOP_SECONDS = 0.55;
const MAN_HIT = 0.6;
const CAR_HIT = 1.0;

// What he says. Hover lines rotate so repeat visits get something new.
const HOVER_LINES = [
  "Hey, I'm Viswesh.",
  "Click me — let's go for a lap.",
  "Yes, I built this whole site.",
  "Scroll down, I'll drive you through it.",
  "Photos, code, F1. That's me.",
  "Go on, click. I won't crash. Probably.",
];
const CHEER_LINES = ["Full send!", "Box box? Nah.", "DRS open!", "Woo!", "Faster!", "P1, baby."];
// Said from the cockpit as the car passes each section's gantry (by section id).
const SECTION_LINES: Record<string, string> = {
  projects: "My projects ahead!",
  photography: "Photos next — say cheese.",
  work: "Internship coming up.",
  playground: "Arcade! Don't tell my boss.",
  about: "This part's about me.",
  contact: "Almost at the finish!",
};
// Hovering him once he's parked at the finish.
const FINISH_LINES = ["Scroll up for another lap.", "My email's right there ↓", "Thanks for stopping by!"];

const STOP_U = FINISH_U + 0.012; // where the car pulls up, just past the line
const AT_END = CAM_END - 0.003; // the camera's this far along = bottom of the page
const FINISH_SECONDS = 1.1;
const SPIN_SECONDS = 0.8;
const DONUT_SECONDS = 1.1;
const DOUBLE_CLICK_MS = 260;

/**
 * parked  — the car waits on the line; Viswesh stands beside it.
 * walking — clicked (or the page scrolled): he walks over to the cockpit.
 * hopping — he climbs in.
 * merging — engine on: the car eases from where it waited onto its
 *           racing position ahead of the camera.
 * racing  — follows the scroll, pulls away when you scroll fast, drifts
 *           through bends, lurches forward when clicked, calls out each
 *           section as it passes the gantry. Five quick clicks: a donut.
 * finishing / finished — at the bottom of the page the car pulls up past
 *           the chequered line and he climbs out to wave; scroll back up
 *           and he jumps back in.
 * Double-click him while he waits and he does a spin.
 */
// What the speech bubble must never sit on top of.
const CONTENT = "p, h1, h2, h3, h4, h5, li, a, button, img, pre, figure, label, input, [role='dialog']";

/** Is there page content at this screen point? Text counts only where the
 *  glyphs actually are, not the empty rest of a full-width block. */
function overContent(px: number, py: number) {
  // the bubble and the 3D canvas ignore the pointer, so this finds
  // whatever page element is underneath
  const el = document.elementFromPoint(px, py)?.closest(CONTENT);
  if (!el) return false;
  if (el.matches("img, figure, input, [role='dialog']")) return true;
  // measure only the text itself (a range over an element also returns the
  // boxes of whole child elements, e.g. the headline's full-width lines)
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (px >= r.left - 6 && px <= r.right + 6 && py >= r.top - 6 && py <= r.bottom + 6) return true;
    }
  }
  return false;
}

/** Would a bubble anchored at (x, y) (its bottom-centre) cover page content? */
function coversContent(x: number, y: number, w: number, h: number) {
  const top = y - h - 10; // matches the bubble's margin-top in globals.css
  const rows = [top + 4, top + h / 2, top + h - 4];
  const cols = [x - w / 2 + 6, x, x + w / 2 - 6];
  for (const py of rows) {
    for (const px of cols) {
      if (overContent(px, py)) return true;
    }
  }
  return false;
}

type Mode = "parked" | "walking" | "hopping" | "merging" | "racing" | "finishing" | "finished";

/**
 * The F1 car and its driver. The 3D layer sits behind the page with
 * pointer events off, so clicks are found by casting the cursor's ray and
 * testing how close it passes to him (or the car): a forgiving sphere test.
 */
export default function RacingCar({
  track,
  camU,
  gates,
  gateIds,
}: {
  track: TrackPath;
  camU: React.RefObject<number>;
  gates: number[];
  gateIds: string[];
}) {
  // read inside the frame loop, so keep the latest in a ref
  const gatesRef = useRef({ gates, gateIds });
  useEffect(() => {
    gatesRef.current = { gates, gateIds };
  }, [gates, gateIds]);
  const car = useRef<THREE.Group>(null);
  const man = useRef<THREE.Group>(null);
  const seatedDriver = useRef<THREE.Group>(null);
  const bubble = useRef<HTMLDivElement | null>(null);
  const seatedRig = useMemo(() => emptyRig(), []);
  const light = useRef<THREE.MeshBasicMaterial>(null);
  const rig = useMemo(() => emptyRig(), []);
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
      board: new THREE.Vector3(), // where he stops beside the cockpit
      seat: new THREE.Vector3(), // where he ends up, in the cockpit
      hopFrom: new THREE.Vector3(),
      look: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
    }),
    []
  );
  const st = useRef({
    mode: "parked" as Mode,
    placed: false,
    startCamU: 0,
    lead: BASE_LEAD,
    mergeT: 0,
    hopT: 0,
    prevU: -1,
    extra: 0,
    speed: 0,
    drift: 0,
    rev: 0,
    walkSpeed: WALK_SPEED,
    ptrX: 0, // cursor, in normalised screen coords
    ptrY: 0,
    ptrSeen: false, // has a mouse moved yet? (touch screens never set it)
    hoverMan: false,
    wave: 0, // 0 → 1 while he waves at the cursor
    cheer: 0, // 1 → 0 after the moving car is clicked: he waves from the cockpit
    hoverLine: 0,
    cheerLine: 0,
    say: { text: "", until: 0, from: "man" as "man" | "seat", next: "" },
    gateSaid: -1, // last gantry he called out
    groundY: 0, // where his feet rest
    finT: 0,
    bye: 0, // forced wave after climbing out at the finish
    finishLine: 0,
    spin: -1, // 0 → 1 while he spins (double-click), -1 when not
    donut: -1, // 0 → 1 while the car spins (five quick clicks), -1 when not
    carClicks: [] as number[],
    phase: 0, // walk cycle
  });

  /** Show a speech bubble over his head for a few seconds. */
  function say(text: string, seconds: number, from: "man" | "seat" = "man") {
    // `until` is set on the next frame, against the scene clock
    st.current.say = { text, until: -seconds, from, next: text };
  }

  function startWalk(run: boolean) {
    const s = st.current;
    if (run) s.walkSpeed = RUN_SPEED;
    if (s.mode !== "parked") return;
    s.mode = "walking";
    say(run ? "Wait for me!" : "On my way!", 1.6);
    window.dispatchEvent(new Event(CAR_ON_TRACK_EVENT)); // hides the hero hint
  }

  // click / tap him to send him to the car; click the moving car to blip it
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const world = new THREE.Vector3();
    let hovering = false;

    const overPageUi = (e: MouseEvent) =>
      !!(e.target as Element | null)?.closest("a, button, input, [data-cursor], [role='dialog']");
    // the speech bubble is plain DOM, positioned over his head each frame
    const el = document.createElement("div");
    el.className = "driver-bubble";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    bubble.current = el;

    // say hello once the lights-out intro has cleared
    const greet = () => {
      if (st.current.mode !== "parked") return;
      const touch = window.matchMedia("(pointer: coarse)").matches;
      say(touch ? "Tap me — let's go for a lap." : "Hey! Click me.", 3.5);
    };
    const greetTimer = window.setTimeout(() => {
      if (!document.documentElement.classList.contains("intro")) greet();
      else window.addEventListener(INTRO_DONE_EVENT, () => window.setTimeout(greet, 600), { once: true });
    }, 900);

    const near = (e: MouseEvent, obj: THREE.Object3D | null, radius: number, lift = 0) => {
      if (!obj || !obj.visible || overPageUi(e)) return false;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      obj.getWorldPosition(world);
      world.y += lift;
      return ray.ray.distanceToPoint(world) < radius;
    };
    const overMan = (e: MouseEvent) => near(e, man.current, MAN_HIT, 0.55 * MAN_SCALE);
    let pendingClick = 0;
    const overCar = (e: MouseEvent) => near(e, car.current, CAR_HIT);

    function onMove(e: MouseEvent) {
      const s = st.current;
      s.ptrX = (e.clientX / window.innerWidth) * 2 - 1;
      s.ptrY = -(e.clientY / window.innerHeight) * 2 + 1;
      s.ptrSeen = true;
      const wasOver = s.hoverMan;
      s.hoverMan = (s.mode === "parked" || s.mode === "finished") && overMan(e);
      if (s.hoverMan && !wasOver) {
        if (s.mode === "finished") {
          say(FINISH_LINES[s.finishLine % FINISH_LINES.length], 2.6);
          s.finishLine += 1;
        } else {
          say(HOVER_LINES[s.hoverLine % HOVER_LINES.length], 2.6);
          s.hoverLine += 1;
        }
      }
      const on = s.hoverMan || (s.mode === "racing" && overCar(e));
      if (on === hovering) return;
      hovering = on;
      document.documentElement.classList.toggle("car-hover", on);
    }
    function onClick(e: MouseEvent) {
      const s = st.current;
      if (s.mode === "parked" && overMan(e)) {
        // wait a beat: a second click turns it into a double-click spin
        if (pendingClick) {
          window.clearTimeout(pendingClick);
          pendingClick = 0;
          if (s.spin < 0) {
            s.spin = 0;
            say("Wheee!", 1.2);
          }
        } else {
          pendingClick = window.setTimeout(() => {
            pendingClick = 0;
            if (st.current.mode === "parked" && st.current.spin < 0) startWalk(false);
          }, DOUBLE_CLICK_MS);
        }
      } else if (s.mode === "racing" && overCar(e)) {
        s.rev = 1;
        s.cheer = 1;
        const now = performance.now();
        s.carClicks = s.carClicks.filter((c) => now - c < 2500);
        s.carClicks.push(now);
        if (s.carClicks.length >= 5 && s.donut < 0) {
          s.carClicks = [];
          s.donut = 0;
          say("Okay… now I'm dizzy.", 2, "seat");
        } else {
          say(CHEER_LINES[s.cheerLine % CHEER_LINES.length], 1.5, "seat");
          s.cheerLine += 1;
        }
      }
    }

    const onGo = () => startWalk(false);
    window.addEventListener(DRIVER_GO_EVENT, onGo);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener(DRIVER_GO_EVENT, onGo);
      window.clearTimeout(greetTimer);
      window.clearTimeout(pendingClick);
      el.remove();
      bubble.current = null;
      document.documentElement.classList.remove("car-hover");
    };
    // startWalk / say only touch refs, so they're safe to leave out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useFrame(({ clock }, delta) => {
    const g = car.current;
    const m = man.current;
    if (!g || !m) return;
    const s = st.current;
    const t = clock.elapsedTime;
    const camNow = camU.current;
    if (s.prevU < 0) s.prevU = camNow;

    // camera speed along the track (fraction per second), smoothed
    const vel = (camNow - s.prevU) / Math.max(delta, 1 / 240);
    s.prevU = camNow;
    s.speed += (vel - s.speed) * 0.1;

    // first frame: car waiting on the line, him standing beside it
    if (!s.placed) {
      const u0 = camNow + BASE_LEAD;
      sampleAt(track.pos, u0, v.p);
      sampleAt(track.pos, Math.min(u0 + 0.004, 1), v.ahead);
      g.position.set(v.p.x, v.p.y + RIDE_HEIGHT, v.p.z);
      g.lookAt(v.ahead.x, v.p.y + RIDE_HEIGHT, v.ahead.z);
      g.updateMatrixWorld();

      const side = (camera as THREE.PerspectiveCamera).aspect < 1 ? MAN_SIDE_NARROW : MAN_SIDE;
      const um = Math.min(u0 + 0.005, 1);
      sampleAt(track.pos, um, v.p);
      sampleAt(track.side, um, v.side);
      m.position.set(v.p.x + v.side.x * side, v.p.y, v.p.z + v.side.z * side);
      s.groundY = v.p.y;
      v.board.set(BOARD_SIDE, 0, -0.03);
      g.localToWorld(v.board);
      v.board.y = m.position.y;
      v.seat.set(0, 0, -0.03);
      g.localToWorld(v.seat);
      s.placed = true;
      s.startCamU = camNow;
    }

    // scrolled before anyone clicked him? he jogs over by himself
    if (Math.abs(camNow - s.startCamU) > 0.002 && (s.mode === "parked" || s.mode === "walking")) startWalk(true);

    // the camera is about to drive through him: skip straight to him seated
    if ((s.mode === "walking" || s.mode === "hopping") && camNow - s.startCamU > 0.012) boardNow(s);

    // reached the bottom of the page: pull up past the finish and climb out
    if (s.mode === "racing" && camNow >= AT_END) {
      v.mergeFrom.copy(g.position);
      v.mergeFromQ.copy(g.quaternion);
      s.finT = 0;
      s.mode = "finishing";
    }
    // scrolled back up from the finish: back in, and off again
    if (s.mode === "finished" && camNow < AT_END - 0.02) boardNow(s, "Back to it!");

    animateMan(m, s, t, delta);
    animateSeated(s, t, delta);
    placeBubble(s, t);

    // ---- the racing-line pose (used while merging and racing) ----
    const targetExtra = THREE.MathUtils.clamp(s.speed * 0.5, MIN_EXTRA_LEAD, MAX_EXTRA_LEAD);
    s.extra += (targetExtra - s.extra) * 0.04;
    s.rev *= Math.pow(0.12, delta);
    const u = Math.min(camNow + s.lead + s.extra + s.rev * 0.012, 0.995);

    // call out each section as the car passes its gantry (heading down only)
    if (s.mode === "racing" && s.speed > 0) {
      const { gates: gs, gateIds: ids } = gatesRef.current;
      for (let i = s.gateSaid + 1; i < gs.length && gs[i] <= u; i++) {
        s.gateSaid = i;
        const line = SECTION_LINES[ids[i]];
        if (line) say(line, 2, "seat");
      }
    }
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

    const idle = Math.sin(t * 38) * (0.004 + s.rev * 0.02);
    const slide = -s.drift * 0.35; // body slides toward the outside of the bend
    const pose = v.pose;
    pose.position.set(v.p.x + v.side.x * slide, v.p.y + RIDE_HEIGHT + idle, v.p.z + v.side.z * slide);
    pose.lookAt(v.ahead.x + v.side.x * slide, v.ahead.y + RIDE_HEIGHT, v.ahead.z + v.side.z * slide);
    pose.rotateY(s.drift);
    pose.rotateZ(-s.drift * 0.15); // a little body roll

    // five quick clicks: a full donut on the spot
    if (s.donut >= 0) {
      s.donut += delta / DONUT_SECONDS;
      if (s.donut >= 1) s.donut = -1;
      else pose.rotateY(Math.PI * 2 * (1 - Math.pow(1 - s.donut, 3)));
    }

    if (s.mode === "merging") {
      s.mergeT = Math.min(s.mergeT + delta / MERGE_SECONDS, 1);
      const e = s.mergeT < 0.5 ? 2 * s.mergeT * s.mergeT : 1 - Math.pow(-2 * s.mergeT + 2, 2) / 2; // ease in-out
      g.position.lerpVectors(v.mergeFrom, pose.position, e);
      g.quaternion.slerpQuaternions(v.mergeFromQ, pose.quaternion, e);
      if (s.mergeT >= 1) s.mode = "racing";
    } else if (s.mode === "racing") {
      g.position.copy(pose.position);
      g.quaternion.copy(pose.quaternion);
    } else if (s.mode === "finishing") {
      // ease to a stop just past the chequered line
      s.finT = Math.min(s.finT + delta / FINISH_SECONDS, 1);
      const e = 1 - Math.pow(1 - s.finT, 3);
      sampleAt(track.pos, STOP_U, v.p);
      sampleAt(track.pos, Math.min(STOP_U + 0.004, 1), v.ahead);
      pose.position.set(v.p.x, v.p.y + RIDE_HEIGHT, v.p.z);
      pose.lookAt(v.ahead.x, v.p.y + RIDE_HEIGHT, v.ahead.z);
      g.position.lerpVectors(v.mergeFrom, pose.position, e);
      g.quaternion.slerpQuaternions(v.mergeFromQ, pose.quaternion, e);
      if (s.finT >= 1) climbOut(s, m, g);
    }

    if (light.current) {
      const moving = s.mode === "racing" ? Math.abs(s.speed) * 4 : 0;
      const waiting = s.mode === "parked" || s.mode === "walking" || s.mode === "finished" ? 0 : 0.1;
      light.current.opacity = 0.12 + waiting + Math.min(moving + s.rev * 0.6, 0.65);
    }
  });

  /** Idle sway, the walk over, and the hop into the cockpit. */
  function animateMan(m: THREE.Group, s: typeof st.current, t: number, delta: number) {
    const { lLeg, rLeg, lArm, rArm, body, head } = rig;
    if (s.mode === "parked" || s.mode === "finished") {
      // standing easy, facing the camera
      v.look.set(camera.position.x, m.position.y, camera.position.z);
      m.lookAt(v.look);
      // double-click: one full spin, with a little hop
      if (s.spin >= 0) {
        s.spin += delta / SPIN_SECONDS;
        if (s.spin >= 1) {
          s.spin = -1;
          m.position.y = s.groundY;
        } else {
          const k = 1 - Math.pow(1 - s.spin, 2);
          m.rotateY(Math.PI * 2 * k);
          m.position.y = s.groundY + Math.sin(s.spin * Math.PI) * 0.12;
        }
      }
      if (body) body.position.y = Math.sin(t * 1.6) * 0.004 + s.wave * Math.abs(Math.sin(t * 5)) * 0.01;
      if (head) {
        let yaw: number;
        let pitch = 0;
        if (s.ptrSeen) {
          // look at the cursor: compare it with where his head is on screen
          v.tmp.copy(m.position);
          v.tmp.y += 1.02 * MAN_SCALE;
          v.tmp.project(camera);
          yaw = THREE.MathUtils.clamp(-(s.ptrX - v.tmp.x) * 1.4, -0.85, 0.85);
          pitch = THREE.MathUtils.clamp(-(s.ptrY - v.tmp.y) * 0.9, -0.4, 0.35);
        } else {
          // no mouse (touch): glance around now and then
          yaw = Math.sin(t * 0.5) * 0.35 * Math.max(0, Math.sin(t * 0.23));
        }
        head.rotation.y += (yaw - head.rotation.y) * 0.12;
        head.rotation.x += (pitch - head.rotation.x) * 0.12;
      }
      // hover him and he waves back (and he waves goodbye at the finish)
      s.bye = Math.max(0, s.bye - delta);
      s.wave += ((s.hoverMan || s.bye > 0 ? 1 : 0) - s.wave) * 0.12;
      const waveZ = -2.55 + Math.sin(t * 11) * 0.32;
      if (lArm) lArm.rotation.set(0.12 * (1 - s.wave), 0, 0.16); // hand toward the pocket
      if (rArm) rArm.rotation.set(0, 0, THREE.MathUtils.lerp(-0.07 + Math.sin(t * 1.6) * 0.01, waveZ, s.wave));
      return;
    }
    if (s.mode === "walking") {
      v.tmp.subVectors(v.board, m.position);
      v.tmp.y = 0;
      const dist = v.tmp.length();
      const step = s.walkSpeed * delta;
      if (dist <= step) {
        m.position.copy(v.board);
        s.mode = "hopping";
        s.hopT = 0;
        v.hopFrom.copy(m.position);
        return;
      }
      m.position.addScaledVector(v.tmp.normalize(), step);
      v.look.copy(m.position).add(v.tmp);
      m.lookAt(v.look);
      const run = s.walkSpeed > WALK_SPEED;
      s.phase += delta * (run ? 15 : 8);
      const swing = Math.sin(s.phase) * (run ? 0.85 : 0.55);
      if (lLeg) lLeg.rotation.x = swing;
      if (rLeg) rLeg.rotation.x = -swing;
      if (lArm) lArm.rotation.set(-swing * 0.8, 0, 0.1);
      if (rArm) rArm.rotation.set(swing * 0.8, 0, -0.1);
      if (body) body.position.y = Math.abs(Math.cos(s.phase)) * (run ? 0.05 : 0.025);
      if (head) {
        head.rotation.y *= 0.9;
        head.rotation.x *= 0.9;
      }
      return;
    }
    if (s.mode === "hopping") {
      s.hopT = Math.min(s.hopT + delta / HOP_SECONDS, 1);
      const k = s.hopT;
      // turn to face down the track, step up and over into the seat
      v.look.copy(v.seat);
      car.current!.getWorldDirection(v.tmp);
      m.position.lerpVectors(v.hopFrom, v.seat, k);
      m.position.y = v.hopFrom.y + Math.sin(k * Math.PI) * 0.22 - k * 0.25;
      m.lookAt(v.look.add(v.tmp));
      if (lLeg) lLeg.rotation.x = -1.3 * k;
      if (rLeg) rLeg.rotation.x = -1.3 * k;
      if (lArm) lArm.rotation.set(-1.1 * k, 0, 0.12);
      if (rArm) rArm.rotation.set(-1.1 * k, 0, -0.12);
      if (k >= 1) boardNow(s);
    }
  }

  /** In the cockpit: a wave when the moving car is clicked. */
  function animateSeated(s: typeof st.current, t: number, delta: number) {
    s.cheer *= Math.pow(0.3, delta);
    const { rArm, head } = seatedRig;
    const c = s.cheer;
    if (rArm) rArm.rotation.set(THREE.MathUtils.lerp(-1.1, 0, c), 0, THREE.MathUtils.lerp(-0.12, -2.6 + Math.sin(t * 13) * 0.35, c));
    if (head) head.rotation.z = Math.sin(t * 9) * 0.12 * c;
  }

  /** Keeps the speech bubble above whichever head is speaking. */
  function placeBubble(s: typeof st.current, t: number) {
    const el = bubble.current;
    if (!el) return;
    const sp = s.say;
    if (sp.until < 0) sp.until = t - sp.until; // just said: start its timer
    if (sp.next) {
      el.textContent = sp.next;
      sp.next = "";
    }
    const head = sp.from === "seat" ? seatedRig.head : rig.head;
    const holder = sp.from === "seat" ? seatedDriver.current : man.current;
    let show = t < sp.until && !!head && !!holder?.visible;
    if (show && head) {
      head.getWorldPosition(v.tmp);
      v.tmp.y += 0.16;
      v.tmp.project(camera);
      show = v.tmp.z < 1 && Math.abs(v.tmp.x) < 1.1 && Math.abs(v.tmp.y) < 1.1;
      if (show) {
        const x = ((v.tmp.x + 1) / 2) * window.innerWidth;
        const y = ((1 - v.tmp.y) / 2) * window.innerHeight;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        // never cover what someone is reading: skip the line if the bubble
        // would sit over text, an image or a control on the page
        show = !coversContent(x, y, el.offsetWidth, el.offsetHeight);
      }
    }
    el.classList.toggle("is-on", show);
  }

  /** At the finish: the car has stopped; he steps out beside it and waves. */
  function climbOut(s: typeof st.current, m: THREE.Group, g: THREE.Group) {
    g.updateMatrixWorld();
    v.tmp.set(BOARD_SIDE * 1.4, 0, -0.1);
    g.localToWorld(v.tmp);
    s.groundY = g.position.y - RIDE_HEIGHT;
    m.position.set(v.tmp.x, s.groundY, v.tmp.z);
    m.visible = true;
    if (seatedDriver.current) seatedDriver.current.visible = false;
    const { lLeg, rLeg, body } = rig;
    if (lLeg) lLeg.rotation.x = 0;
    if (rLeg) rLeg.rotation.x = 0;
    if (body) body.position.y = 0;
    s.mode = "finished";
    s.bye = 2.4;
    say("Thanks for the lap — let's talk ↓", 5);
  }

  /** He's in: swap to the seated driver and fire it up. */
  function boardNow(s: typeof st.current, line = "Lights out!") {
    if (man.current) man.current.visible = false;
    if (seatedDriver.current) seatedDriver.current.visible = true;
    const g = car.current!;
    v.mergeFrom.copy(g.position);
    v.mergeFromQ.copy(g.quaternion);
    s.mergeT = 0;
    s.rev = 1;
    s.mode = "merging";
    s.spin = -1;
    playSound("engine"); // only if the visitor turned sound on
    say(line, 1.6, "seat");
  }

  return (
    <>
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
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
        {/* him, once he's in: head and shoulders above the cockpit */}
        <group ref={seatedDriver} visible={false} position={[0, -0.375, -0.03]} scale={0.495}>
          <ManModel seated rig={seatedRig} />
        </group>
      </group>
      <group ref={man} scale={MAN_SCALE}>
        <ManModel rig={rig} />
      </group>
    </>
  );
}
