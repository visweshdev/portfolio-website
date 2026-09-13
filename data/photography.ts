export type Photo = {
  id: string;
  // Path to the real image once supplied. Left null while using the
  // clearly-marked placeholder renderer — see components/PolaroidImage.tsx.
  src: string | null;
  caption: string;
  category: "street" | "motorsport" | "study" | "travel";
  year: string;
  rotation: number; // degrees, small values only — controlled imperfection
};

/**
 * Real photographs, served from /public/photography/. Add more the same
 * way: drop the file in that folder and add an entry here — no
 * component code needs to change.
 */
export const photography: Photo[] = [
  {
    id: "buggy",
    src: "/photography/buggy.jpg",
    caption: "Closest I've been to an actual pit lane.",
    category: "motorsport",
    year: "2026",
    rotation: -2,
  },
  {
    id: "storm-lake",
    src: "/photography/storm-lake.jpg",
    caption: "Weather app said 10% chance of rain.",
    category: "travel",
    year: "2026",
    rotation: 1.5,
  },
  {
    id: "campus",
    src: "/photography/campus.jpg",
    caption: "Four years, one long walk to class.",
    category: "study",
    year: "2026",
    rotation: -1,
  },
  {
    id: "sunset",
    src: "/photography/sunset.jpg",
    caption: "No filter. The sky just went for it.",
    category: "travel",
    year: "2026",
    rotation: 2,
  },
  {
    id: "lake-boats",
    src: "/photography/lake-boats.jpg",
    caption: "Pedal boats: the world's slowest go-karts.",
    category: "travel",
    year: "2026",
    rotation: -1.5,
  },
];
