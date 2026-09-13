import { Space_Grotesk, Inter, IBM_Plex_Mono, Caveat } from "next/font/google";

// Display / hero / section headings — bold, geometric, confident.
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

// Body copy — clean, quiet, readable.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Technical metadata / timestamps / labels.
export const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Handwritten-style annotations — used sparingly, small labels only.
export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});
