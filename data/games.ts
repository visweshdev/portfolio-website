export type GameMeta = {
  id: string;
  title: string;
  tagline: string;
  controls: string;
  accent: "accent" | "red";
};

// A small in-browser arcade — familiar 2010s casual-game mechanics,
// rebuilt from scratch (no original assets/branding), optimized for
// canvas/DOM rendering and lazy-loaded one at a time.
export const games: GameMeta[] = [
  { id: "2048", title: "2048", tagline: "Slide, merge, reach the tile.", controls: "ARROWS / SWIPE", accent: "accent" },
  { id: "flappy", title: "FLAPPY FLYER", tagline: "One tap. Don't clip a pipe.", controls: "SPACE / TAP", accent: "red" },
  { id: "word-guess", title: "WORD GUESS", tagline: "Six tries, five letters.", controls: "KEYBOARD / TAP", accent: "accent" },
  { id: "memory-match", title: "MEMORY MATCH", tagline: "Flip two, find the pair.", controls: "CLICK / TAP", accent: "red" },
  { id: "connect-four", title: "CONNECT FOUR", tagline: "Four in a row wins.", controls: "CLICK / TAP", accent: "accent" },
  { id: "reaction-time", title: "REACTION TIME", tagline: "How fast are you, really?", controls: "CLICK / TAP", accent: "red" },
];
