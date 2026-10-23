"use client";

import type { Project } from "@/data/projects";
import { playSound } from "@/lib/sound";

const LINK =
  "label-mono !text-[11px] border border-fg-faint rounded-full px-4 py-2 text-fg hover:border-accent hover:text-accent transition-colors";

/** External source / live-demo buttons for a project. Renders nothing if it has neither. */
export default function ProjectLinks({ links, className = "" }: { links: Project["links"]; className?: string }) {
  if (!links?.repo && !links?.demo) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.demo && (
        <a href={links.demo} target="_blank" rel="noopener noreferrer" onClick={() => playSound("pop")} data-cursor="link" className={LINK}>
          LIVE DEMO ↗
        </a>
      )}
      {links.repo && (
        <a href={links.repo} target="_blank" rel="noopener noreferrer" onClick={() => playSound("pop")} data-cursor="link" className={LINK}>
          SOURCE CODE ↗
        </a>
      )}
    </div>
  );
}
