"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import PhotoLightbox from "@/components/PhotoLightbox";
import { CATEGORY_LABEL, photoWallSource, type Photo } from "@/data/photography";
import { playSound } from "@/lib/sound";
import { useRichMotion } from "@/lib/useRichMotion";

const SPACING = 0.5; // radians between prints
const DRAG_THRESHOLD = 6;

function turnOrbit(orbit: HTMLDivElement | null, yaw: number) {
  if (orbit) orbit.style.transform = `translateZ(var(--photo-wall-distance)) rotateY(${yaw}rad)`;
}

/**
 * HTML prints in a CSS 3D scene. Their positions and images can render
 * from the initial page; hydration adds dragging, drift and the lightbox.
 */
export default function PhotoWallSection({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<Photo | null>(null);
  const rich = useRichMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const motion = useRef({
    yaw: 0, velocity: 0, elapsed: 0, hovered: false, focused: false,
    pointerId: null as number | null, startX: 0, lastX: 0, moved: false,
  });
  const prints = photos.filter((photo) => photo.src);
  const limit = Math.max(0, (prints.length - 1) / 2) * SPACING;

  useEffect(() => {
    const viewport = viewportRef.current;
    const orbit = orbitRef.current;
    if (!rich || open || !viewport || !orbit) return;

    const state = motion.current;
    let frame = 0;
    let previous = 0;
    let visible = false;
    let drawnYaw = state.yaw;

    function tick(now: number) {
      const step = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      state.elapsed += step;
      if (state.pointerId === null && !state.focused) {
        const decay = Math.pow(0.9, step * 60);
        state.yaw += state.velocity * (1 - decay) / 0.1;
        state.velocity *= decay;
        if (Math.abs(state.velocity) < 0.0001 && !state.hovered) {
          state.yaw += Math.sin(state.elapsed * 0.25) * 0.0008 * step * 60;
        }
      }
      state.yaw = Math.min(limit, Math.max(-limit, state.yaw));
      if (state.yaw !== drawnYaw) {
        turnOrbit(orbit, state.yaw);
        drawnYaw = state.yaw;
      }
      frame = requestAnimationFrame(tick);
    }

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      delete viewport.dataset.animating;
    };
    const sync = () => {
      if (visible && !document.hidden) {
        viewport.dataset.animating = "true";
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(viewport);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [limit, open, rich]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const state = motion.current;
    if (!event.isPrimary || event.button !== 0 || state.pointerId !== null) return;
    state.pointerId = event.pointerId;
    state.startX = state.lastX = event.clientX;
    state.moved = false;
    state.velocity = 0;
    state.focused = false;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = motion.current;
    if (state.pointerId !== event.pointerId) return;
    if (!state.moved && Math.abs(event.clientX - state.startX) <= DRAG_THRESHOLD) return;
    if (!state.moved) {
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    const step = (event.clientX - state.lastX) * 0.004;
    state.lastX = event.clientX;
    state.yaw = Math.min(limit, Math.max(-limit, state.yaw - step));
    state.velocity = -step;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = motion.current;
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    if (event.type !== "pointerup") state.velocity = 0;
    delete event.currentTarget.dataset.dragging;
  }

  return (
    <div role="region" aria-label="Photo wall" className="photo-wall mt-12">
      <p className="label-mono text-fg-subtle mb-3">DRAG TO LOOK ALONG THE WALL · CLICK A PRINT TO OPEN IT</p>
      <div
        ref={viewportRef}
        data-cursor="drag"
        className="photo-wall-viewport relative h-[70svh] min-h-[420px] rounded-2xl border border-fg-faint/25 bg-bg-raised/40 select-none cursor-grab data-[dragging]:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onPointerLeave={(event) => {
          motion.current.hovered = false;
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) endDrag(event);
        }}
      >
        <div className="photo-wall-perspective">
          <div className="photo-wall-orbit" ref={orbitRef}>
            {prints.map((photo, index) => {
              const angle = (index - (prints.length - 1) / 2) * SPACING;
              return (
                <button
                  key={photo.id}
                  type="button"
                  className="photo-wall-print"
                  aria-label={`View photo: ${photo.caption} (${CATEGORY_LABEL[photo.category]}, ${photo.year})`}
                  style={{
                    "--print-angle": `${-angle}rad`,
                    "--print-height": index % 2 === 0 ? 0.25 : -0.35,
                    "--print-rotation": `${-photo.rotation}deg`,
                    "--print-delay": `${-index / 0.7}s`,
                  } as CSSProperties}
                  onPointerEnter={() => { motion.current.hovered = true; }}
                  onPointerLeave={() => { motion.current.hovered = false; }}
                  onFocus={(event) => {
                    if (!event.currentTarget.matches(":focus-visible")) return;
                    motion.current.focused = true;
                    motion.current.velocity = 0;
                    motion.current.yaw = angle;
                    turnOrbit(orbitRef.current, angle);
                  }}
                  onBlur={() => { motion.current.focused = false; }}
                  onClick={(event) => {
                    if (event.detail > 0 && motion.current.moved) return;
                    playSound("pop");
                    setOpen(photo);
                  }}
                >
                  <span style={{ backgroundImage: `url("${photoWallSource(photo)}")` }} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {open && <PhotoLightbox photo={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
