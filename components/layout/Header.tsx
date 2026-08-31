"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { siteConfig, telHref } from "@/lib/site-config";
import { navItems } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MENU_ID = "mobile-nav";

/** Everything focusable the trap needs to cycle through. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /**
   * Closing always returns focus to the toggle. Without this, dismissing the menu drops the focus
   * ring onto <body> and a keyboard user restarts from the top of the document every time.
   */
  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  /**
   * The menu is an overlay panel, so it owes the four things an overlay owes (backlog §11.6). It
   * previously had `aria-expanded` and nothing else: no Escape, no focus containment, no scroll
   * lock, and it closed only because every link happened to carry an onClick.
   */
  useEffect(() => {
    if (!open) return;

    // 1. Scroll lock — the page behind an open menu must not move under the finger.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Move focus into the panel so the next Tab lands inside it, not back in the page.
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      // 3. Escape closes, as every dismissible overlay must.
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      // 4. Focus trap. Tab out of either end wraps to the other, so focus cannot escape to the
      //    page behind the menu while the menu is covering it.
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) return;

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} — דף הבית`}>
          {/* Plain <img>, not next/image: `images.unoptimized` is true, so next/image emits no
              srcset here and only adds client JS. Intrinsic size is declared so the header
              reserves the box before the logo paints (CLS). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gagoline_logo.png"
            alt={siteConfig.name}
            width={600}
            height={166}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="ראשי" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={telHref}
            data-cta="header-call"
            variant="accent"
            className="hidden sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            <span dir="ltr">{siteConfig.phone}</span>
          </Button>

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary lg:hidden"
            aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => (open ? close(false) : setOpen(true))}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu. `hidden` (display:none) when closed, which keeps its links out of the tab
          order without needing tabindex bookkeeping. */}
      <div
        id={MENU_ID}
        ref={panelRef}
        className={cn("border-t border-gray-100 lg:hidden", open ? "block" : "hidden")}
      >
        <Container className="py-4">
          <nav aria-label="ראשי נייד">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                    onClick={() => close(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/*
           * `menu-call`, not `header-call`. The two surfaces are different decisions — a call from
           * the always-visible header bar versus one from an opened mobile menu — and sharing a
           * single data-cta value made them permanently indistinguishable in the container.
           */}
          <Button
            href={telHref}
            data-cta="menu-call"
            variant="accent"
            size="lg"
            className="mt-3 w-full"
          >
            <Phone className="h-5 w-5" aria-hidden />
            חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
          </Button>
        </Container>
      </div>
    </header>
  );
}
