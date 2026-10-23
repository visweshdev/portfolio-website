import PaperForgeCollage from "@/components/PaperForgeCollage";
import URLShortenerCollage from "@/components/URLShortenerCollage";

/**
 * The one place a project's scrapbook visual is registered, keyed by
 * project slug. Projects without an entry simply render no collage.
 */
export const COLLAGES: Record<string, React.ComponentType<{ className?: string }>> = {
  paperforge: PaperForgeCollage,
  "url-shortener": URLShortenerCollage,
};
