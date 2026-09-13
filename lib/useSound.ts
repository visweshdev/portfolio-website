"use client";

import { useSyncExternalStore } from "react";
import { isSoundEnabled, subscribeSound } from "@/lib/sound";

function getServerSnapshot() {
  return false;
}

/** Reactive read of the global sound on/off state (see lib/sound.ts). */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribeSound, isSoundEnabled, getServerSnapshot);
}
