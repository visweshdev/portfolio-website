"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { playSound } from "@/lib/sound";

type Props = ComponentProps<typeof Link> & { sound?: "click" | "pop" };

/**
 * A drop-in `next/link` that also plays a sound on click — lets a
 * Server Component page (like the project detail pages) get sound
 * feedback on a link without converting the whole page to a Client
 * Component just for one handler.
 */
export default function SoundLink({ sound = "click", onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        playSound(sound);
        onClick?.(e);
      }}
    />
  );
}
