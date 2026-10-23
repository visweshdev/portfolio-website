// Each nav item scrolls to its section on the homepage (the `id` of that
// <section>); from any other page it goes back to the homepage at that
// section. The standalone pages (/projects, /work, …) are still reachable
// from each section's own "view all" link.
export const navLinks = [
  { section: "projects", label: "PROJECTS" },
  { section: "work", label: "WORK" },
  { section: "photography", label: "PHOTOGRAPHY" },
  { section: "playground", label: "PLAYGROUND" },
  { section: "about", label: "ABOUT" },
];

/** The site's standalone pages — used for the sitemap. */
export const pages = ["/projects", "/work", "/photography", "/playground", "/about"];

export const contact = {
  email: "visweshkesarla@gmail.com",
  linkedin: "https://linkedin.com/in/visweshkesarla",
  github: "https://github.com/visweshdev",
  resumeHref: "/resume.pdf",
};
