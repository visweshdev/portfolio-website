// Shared by the lights-out intro (client), the hero (client) and the
// pre-paint inline script in app/layout.tsx (server). Kept out of the
// "use client" component file so the server gets the plain strings.

/** Fired on window once the intro overlay has fully cleared. */
export const INTRO_DONE_EVENT = "intro:done";
