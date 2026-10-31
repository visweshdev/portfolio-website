"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsapConfig";
import { lenisInstance } from "@/lib/lenisInstance";
import { playSound } from "@/lib/sound";
import { INTRO_DONE_EVENT, SCENE_READY_EVENT } from "@/lib/intro";

const LIGHTS = 5;

/**
 * The loading screen: an F1-style race start, shown every time the site is
 * opened or reloaded (not on navigations within it): five pairs of
 * red lights come on one by one, hold for a random beat, then all go out
 * at once — and the site appears. Click, tap or press any key to skip.
 *
 * Whether it shows is decided before first paint by the inline script
 * in app/layout.tsx (it adds `intro` to <html> unless the visitor
 * prefers reduced motion), so there's never a flash
 * of the page before the overlay. Purely decorative: aria-hidden, and
 * the page underneath stays in the accessibility tree.
 */
export default function LightsOut() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    if (!root || !html.classList.contains("intro")) return;

    ensureGsap();
    const lights = root.querySelectorAll<HTMLElement>("[data-light]");
    let finished = false;

    // Lenis may already be running underneath — hold it still too.
    const stopTimer = window.setTimeout(() => lenisInstance.current?.stop(), 0);

    function finish() {
      if (finished) return;
      finished = true;
      tl.kill();
      gsap.to(root, {
        yPercent: -100,
        duration: 0.7,
        ease: "power3.inOut",
        onComplete: () => {
          html.classList.remove("intro");
          lenisInstance.current?.start();
          window.dispatchEvent(new Event(INTRO_DONE_EVENT));
        },
      });
    }

    const hold = 0.3 + Math.random() * 0.6; // the unpredictable wait before lights out
    const tl = gsap.timeline({ delay: 0.3 });
    lights.forEach((light) => {
      tl.add(() => {
        light.dataset.on = "true";
        playSound("click");
      }).to({}, { duration: 0.38 });
    });
    // On the homepage, keep the lights on until the 3D track has drawn its
    // first frame, so lights-out reveals the finished hero. Capped, so a
    // slow device or a WebGL failure never leaves anyone stuck here.
    tl.add(() => {
      const w = window as unknown as { __sceneExpected?: boolean; __sceneReady?: boolean };
      if (!w.__sceneExpected || w.__sceneReady) return;
      tl.pause();
      const go = () => {
        window.clearTimeout(cap);
        window.removeEventListener(SCENE_READY_EVENT, go);
        if (!finished) tl.resume();
      };
      const cap = window.setTimeout(go, 6000);
      window.addEventListener(SCENE_READY_EVENT, go, { once: true });
    });
    tl.to({}, { duration: hold });
    tl.add(() => {
      lights.forEach((light) => delete light.dataset.on);
      root.dataset.out = "true";
      playSound("whoosh");
    });
    tl.to({}, { duration: 0.45 });
    tl.add(finish);

    function skip() {
      lights.forEach((light) => delete light.dataset.on);
      finish();
    }
    window.addEventListener("keydown", skip, { once: true });
    root.addEventListener("click", skip, { once: true });

    return () => {
      window.clearTimeout(stopTimer);
      window.removeEventListener("keydown", skip);
      root.removeEventListener("click", skip);
      tl.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="lights-out" aria-hidden="true">
      <div className="flex flex-col items-center gap-10">
        <div className="flex gap-3 sm:gap-5 p-3 sm:p-4 rounded-xl bg-[#0f0f0e] border border-fg-faint/40">
          {Array.from({ length: LIGHTS }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 sm:gap-3 p-2 rounded-lg bg-[#050504]">
              <span data-light className="lights-out__bulb" />
              <span className="lights-out__bulb lights-out__bulb--pair" />
            </div>
          ))}
        </div>
        <p className="label-mono lights-out__caption">
          <span className="lights-out__ready">FORMATION LAP COMPLETE</span>
          <span className="lights-out__go">LIGHTS OUT — AND AWAY WE GO</span>
        </p>
      </div>
      <p className="label-mono absolute bottom-8 left-0 right-0 text-center text-fg-subtle">
        <span className="lights-out__hint--mouse">CLICK OR PRESS ANY KEY TO SKIP</span>
        <span className="lights-out__hint--touch">TAP TO SKIP</span>
      </p>
    </div>
  );
}
