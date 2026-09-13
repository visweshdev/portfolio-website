"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { navLinks, contact } from "@/data/nav";
import { scrollToTop } from "@/lib/lenisInstance";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { playSound } from "@/lib/sound";
import SoundToggle from "@/components/SoundToggle";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  // A Link to the current route is otherwise a no-op — this makes the
  // logo always do what it visually promises: take you home, at the top.
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      setOpen(false);
      playSound("click");
      if (pathname === "/") {
        e.preventDefault();
        scrollToTop(!reducedMotion);
      }
    },
    [pathname, reducedMotion]
  );

  const toggleMenu = useCallback(() => {
    playSound(open ? "click" : "pop");
    setOpen((v) => !v);
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 md:py-5">
      <nav
        className="page-pad flex items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href="/"
          onClick={handleLogoClick}
          data-cursor="link"
          className="label-mono !text-[13px] tracking-[0.08em] text-fg hover:text-accent transition-colors"
        >
          VISWESH KESARLA
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => playSound("click")}
                data-cursor="link"
                className="label-mono !text-[11px] text-fg-muted hover:text-fg transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-5">
          <SoundToggle />
          <a
            href={contact.resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("pop")}
            data-cursor="link"
            className="label-mono !text-[11px] text-fg-muted hover:text-accent transition-colors"
          >
            RESUME ↗
          </a>
          <Link
            href="/about#contact"
            onClick={() => playSound("click")}
            data-cursor="link"
            className="label-mono !text-[11px] text-fg-muted hover:text-accent transition-colors"
          >
            CONTACT ↗
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden label-mono !text-[11px] text-fg border border-fg-faint px-3 py-1.5 rounded-full"
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </nav>

      {open && (
        <div className="page-pad md:hidden">
          <div
            id="mobile-nav"
            className="mt-3 flex flex-col gap-1 bg-bg-raised/95 backdrop-blur border border-fg-faint/30 rounded-2xl p-5"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  playSound("click");
                  setOpen(false);
                }}
                className="label-mono !text-sm py-2 text-fg"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-fg-faint/30 my-2" />
            <a
              href={contact.resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("pop")}
              className="label-mono !text-sm py-2 text-fg"
            >
              RESUME ↗
            </a>
            <Link
              href="/about#contact"
              onClick={() => {
                playSound("click");
                setOpen(false);
              }}
              className="label-mono !text-sm py-2 text-fg"
            >
              CONTACT ↗
            </Link>
            <div className="h-px bg-fg-faint/30 my-2" />
            <div className="flex items-center justify-between py-1">
              <span className="label-mono text-fg-faint">SOUND EFFECTS</span>
              <SoundToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
