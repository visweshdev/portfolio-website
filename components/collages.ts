import RelayQueueCollage from "@/components/RelayQueueCollage";
import URLShortenerCollage from "@/components/URLShortenerCollage";
import ReMemCollage from "@/components/ReMemCollage";
import CovenantCollage from "@/components/CovenantCollage";

/**
 * The one place a project's scrapbook visual is registered, keyed by
 * project slug. Projects without an entry simply render no collage.
 */
export const COLLAGES: Record<string, React.ComponentType<{ className?: string }>> = {
  covenant: CovenantCollage,
  remem: ReMemCollage,
  relayqueue: RelayQueueCollage,
  "url-shortener": URLShortenerCollage,
};
