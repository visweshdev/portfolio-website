// Set once, the first time this module is evaluated in the browser —
// which happens exactly once per hard page load, and is NOT reset by
// Next.js client-side navigations (the JS module stays in memory).
// This is what makes the hero's "LAP" clock genuinely mean "time since
// you entered the site," not "time since you last landed on the
// homepage."
export const SESSION_START = typeof performance !== "undefined" ? performance.now() : 0;
