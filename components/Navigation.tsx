"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { navLinks, contact } from "@/data/nav";
import { scrollToSection, scrollToTop } from "@/lib/lenisInstance";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { playSound } from "@/lib/sound";
import SoundToggle from "@/components/SoundToggle";

export default function Navigation() {
  const pathname = usePathname();
  // The menu remembers WHICH route it was opened on, so it's closed
  // automatically on any route change — including back/forward, which
  // never goes through a link's onClick.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = useCallback((next: boolean) => setOpenOn(next ? pathname : null), [pathname]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenOn(null);
        document.getElementById("mobile-nav-toggle")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    [pathname, reducedMotion, setOpen]
  );

  // On the homepage the section links scroll in place; from any other
  // page the Link itself goes to "/#section" and Next scrolls there once
  // the homepage has rendered.
  const handleSectionClick = useCallback(
    (e: React.MouseEvent, section: string) => {
      setOpen(false);
      playSound("click");
      if (pathname === "/") {
        e.preventDefault();
        scrollToSection(section, !reducedMotion);
      }
    },
    [pathname, reducedMotion, setOpen]
  );

  const toggleMenu = useCallback(() => {
    playSound(open ? "click" : "pop");
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 md:py-5" style={{ viewTransitionName: "site-header" }}>
      {/* phones: fade the page out under the bar so the name and MENU
          button never sit on top of photos or text */}
      <div
        aria-hidden="true"
        className="lg:hidden pointer-events-none absolute inset-0 -z-10 bg-bg/80 backdrop-blur-md border-b border-fg-faint/15"
      />
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
        <ul className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <li key={link.section}>
              <Link
                href={`/#${link.section}`}
                onClick={(e) => handleSectionClick(e, link.section)}
                data-cursor="link"
                className="label-mono !text-[11px] text-fg-muted hover:text-fg transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-5">
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
            href="/#contact"
            onClick={(e) => handleSectionClick(e, "contact")}
            data-cursor="link"
            className="label-mono !text-[11px] text-fg-muted hover:text-accent transition-colors"
          >
            CONTACT ↗
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          id="mobile-nav-toggle"
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="lg:hidden label-mono !text-[11px] text-fg border border-fg-faint px-3 py-1.5 rounded-full"
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </nav>

      {open && (
        <div className="page-pad lg:hidden">
          <div
            id="mobile-nav"
            className="mt-3 flex flex-col gap-1 bg-bg-raised/95 backdrop-blur border border-fg-faint/30 rounded-2xl p-5"
          >
            {navLinks.map((link) => (
              <Link
                key={link.section}
                href={`/#${link.section}`}
                onClick={(e) => handleSectionClick(e, link.section)}
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
              href="/#contact"
              onClick={(e) => handleSectionClick(e, "contact")}
              className="label-mono !text-sm py-2 text-fg"
            >
              CONTACT ↗
            </Link>
            <div className="h-px bg-fg-faint/30 my-2" />
            <div className="flex items-center justify-between py-1">
              <span className="label-mono text-fg-subtle">SOUND EFFECTS</span>
              <SoundToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
