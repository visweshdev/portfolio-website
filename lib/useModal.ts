"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { lenisInstance } from "@/lib/lenisInstance";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Shared behavior for full-screen dialogs (the arcade, the photo
 * lightbox): locks page scroll — both native and Lenis, which otherwise
 * keeps scrolling the page underneath — closes on Escape, keeps Tab
 * focus inside the dialog, and hands focus back to whatever opened it.
 *
 * Attach the returned ref to the dialog element, and give that element
 * `tabIndex={-1}` and `data-lenis-prevent` so it can take initial focus
 * and still scroll natively while Lenis is stopped.
 */
export function useModal<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const el = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenisInstance.current?.stop();
    // Focus the dialog itself rather than its first button — a game's
    // Space/Enter key would otherwise "click" the focused close button.
    el?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !el.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenisInstance.current?.start();
      opener?.focus({ preventScroll: true });
    };
  }, []);

  return ref;
}
