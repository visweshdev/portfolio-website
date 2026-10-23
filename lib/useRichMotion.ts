"use client";

import { useFinePointer } from "@/lib/usePointerType";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * True only for a mouse/trackpad visitor who hasn't asked for reduced
 * motion — the gate for the heavy, cursor-driven effects (the 3D track,
 * the photo wall, card tilt, hover distortion). Phones, tablets and
 * reduced-motion visitors get the light, static versions instead.
 * Server-renders as false, so the static version is what ships in HTML.
 */
export function useRichMotion(): boolean {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced;
}
