import buggyWall from "@/public/photography/wall/buggy.webp";
import stormLakeWall from "@/public/photography/wall/storm-lake.webp";
import campusWall from "@/public/photography/wall/campus.webp";
import sunsetWall from "@/public/photography/wall/sunset.webp";
import lakeBoatsWall from "@/public/photography/wall/lake-boats.webp";

export type Photo = {
  id: string;
  // Path to the real image once supplied. Left null while using the
  // clearly-marked placeholder renderer — see components/PolaroidImage.tsx.
  src: string | null;
  wallSrc?: string; // optional pre-sized print texture
  caption: string;
  category: "street" | "motorsport" | "study" | "travel";
  year: string;
  rotation: number; // degrees, small values only — controlled imperfection
};

export const CATEGORY_LABEL: Record<Photo["category"], string> = {
  street: "STREET",
  motorsport: "MOTORSPORT",
  study: "CAMPUS",
  travel: "TRAVEL",
};

export function photoWallSource(photo: Photo) {
  return photo.wallSrc ?? (photo.src ? `/_next/image?url=${encodeURIComponent(photo.src)}&w=828&q=75` : null);
}

/**
 * Real photographs, served from /public/photography/. Add more the same
 * way: drop the file in that folder and add an entry here — no
 * component code needs to change.
 */
export const photography: Photo[] = [
  {
    id: "buggy",
    src: "/photography/buggy.jpg",
    wallSrc: buggyWall.src,
    caption: "Closest I've been to an actual pit lane.",
    category: "motorsport",
    year: "2026",
    rotation: -2,
  },
  {
    id: "storm-lake",
    src: "/photography/storm-lake.jpg",
    wallSrc: stormLakeWall.src,
    caption: "Weather app said 10% chance of rain.",
    category: "travel",
    year: "2026",
    rotation: 1.5,
  },
  {
    id: "campus",
    src: "/photography/campus.jpg",
    wallSrc: campusWall.src,
    caption: "Four years, one long walk to class.",
    category: "study",
    year: "2026",
    rotation: -1,
  },
  {
    id: "sunset",
    src: "/photography/sunset.jpg",
    wallSrc: sunsetWall.src,
    caption: "No filter. The sky just went for it.",
    category: "travel",
    year: "2026",
    rotation: 2,
  },
  {
    id: "lake-boats",
    src: "/photography/lake-boats.jpg",
    wallSrc: lakeBoatsWall.src,
    caption: "Pedal boats: the world's slowest go-karts.",
    category: "travel",
    year: "2026",
    rotation: -1.5,
  },
];
