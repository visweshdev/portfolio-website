import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { pages as sitePages } from "@/data/nav";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", ...sitePages, ...projects.map((p) => `/projects/${p.slug}`)];
  return pages.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
