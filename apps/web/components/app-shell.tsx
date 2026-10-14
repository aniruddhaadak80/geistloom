"use client";

import { Button, cn } from "@geistloom/ui";
import {
  Archive,
  Brain,
  Clock,
  Compass,
  Dna,
  FlaskConical,
  GitBranch,
  Globe2,
  type LucideIcon,
  Menu,
  Scale,
  ScrollText,
  Terminal,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { CommandPalette } from "./command-palette";
import { ROUTES } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

const ROUTE_ICONS: Readonly<Record<string, LucideIcon>> = {
  "/oracle": Brain,
  "/century": Compass,
  "/hallmarks": Dna,
  "/interventions": FlaskConical,
  "/clocks": Clock,
  "/gene-drive": GitBranch,
  "/timeline": ScrollText,
  "/scenarios": Wand2,
  "/worldboard": Globe2,
  "/ethics": Scale,
  "/archive": Archive,
  "/lab": Terminal,
};

function iconFor(href: string): LucideIcon {
  return ROUTE_ICONS[href] ?? Dna;
}

/**
 * App chrome: sticky top nav (logo, 12 routes, command palette
 * trigger, theme toggle, mobile menu) and the footer carrying the
 * determinism promise. Wraps every page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-charcoal bg-abyss/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5">
            <span className="inline-block h-7 w-7 rounded-lg bg-bio-teal" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">geistloom</span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {ROUTES.map((route) => {
              const Icon = iconFor(route.href);
              const active = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  title={route.blurb}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-charcoal text-bio-teal"
                      : "text-mist hover:bg-charcoal hover:text-star-white",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {route.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette (Cmd+K)"
            >
              <Wand2 className="h-4 w-4" aria-hidden />
              <kbd className="hidden rounded border border-charcoal bg-abyss px-1.5 py-0.5 font-mono text-[10px] text-mist sm:inline">
                ⌘K
              </kbd>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Menu className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-charcoal px-6 py-4 lg:hidden" aria-label="Mobile">
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {ROUTES.map((route) => {
                const Icon = iconFor(route.href);
                const active = pathname === route.href;
                return (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-charcoal text-bio-teal"
                          : "text-mist hover:bg-charcoal hover:text-star-white",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {children}

      <footer className="mt-auto border-t border-charcoal">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bio-teal">
            the determinism promise
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
            Every number on Geistloom is computed on your machine by a seeded PRNG — the same seed
            always produces the same universe. No API keys, no network calls, no tracking. The
            simulation is the product, and it is auditable line by line.
          </p>
        </div>
      </footer>
    </div>
  );
}
