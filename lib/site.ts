import { contact } from "@/data/nav";

/**
 * The site's public origin, used for absolute URLs in metadata (Open
 * Graph images, canonical links), the sitemap and robots.txt.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real domain (e.g.
 * https://visweshkesarla.com). On Vercel it falls back to the
 * project's production domain automatically; locally, to localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Viswesh Kesarla";

export const SITE_DESCRIPTION =
  "Personal portfolio of Viswesh Kesarla — Computer Science student building with AI, LLMs and RAG, and shooting photography in the space between.";

/** schema.org Person, rendered as JSON-LD on the homepage. */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  email: `mailto:${contact.email}`,
  jobTitle: "Computer Science student",
  description: SITE_DESCRIPTION,
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Woxsen University" },
  sameAs: [contact.linkedin, contact.github],
};
