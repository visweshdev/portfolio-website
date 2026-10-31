// Shared by the lights-out intro (client), the hero (client) and the
// pre-paint inline script in app/layout.tsx (server). Kept out of the
// "use client" component file so the server gets the plain strings.

/** Fired on window once the intro overlay has fully cleared. */
export const INTRO_DONE_EVENT = "intro:done";

/**
 * Fired on window when the homepage's 3D track has drawn its first frame
 * (window.__sceneReady is set too). The intro holds the lights on until
 * then, so the hero never shows its plain fallback after the lights go out.
 */
export const SCENE_READY_EVENT = "scene:ready";
