import PaperForgeCollage from "@/components/PaperForgeCollage";
import URLShortenerCollage from "@/components/URLShortenerCollage";
import ReMemCollage from "@/components/ReMemCollage";
import RecoverRLCollage from "@/components/RecoverRLCollage";

/**
 * The one place a project's scrapbook visual is registered, keyed by
 * project slug. Projects without an entry simply render no collage.
 */
export const COLLAGES: Record<string, React.ComponentType<{ className?: string }>> = {
  recoverrl: RecoverRLCollage,
  remem: ReMemCollage,
  paperforge: PaperForgeCollage,
  "url-shortener": URLShortenerCollage,
};
