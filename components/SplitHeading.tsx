"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap, motionAllowed, SplitText } from "@/lib/gsapConfig";

/**
 * A heading whose words rise into place, line by line, as it scrolls
 * into view (GSAP SplitText, masked per line). Text stays real HTML —
 * SplitText labels the heading with its full text for screen readers —
 * and re-splits automatically if fonts load late or the width changes.
 * Plays once; plain text under reduced motion.
 */
export default function SplitHeading({
  as: Tag = "h2",
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    ensureGsap();
    let played = false;

    const split = SplitText.create(el, {
      type: "lines,words",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        // a re-split after the entrance (resize, late font) just shows the text
        if (played) return;
        return gsap.from(self.words, {
          yPercent: 110,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onStart: () => {
            played = true;
          },
        });
      },
    });

    return () => split.revert();
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
