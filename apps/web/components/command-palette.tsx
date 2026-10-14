"use client";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { Route as RouteIcon, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES } from "./nav-links";

const ORACLE_PROMPTS: readonly string[] = [
  "solve aging",
  "cure malaria with gene drives",
  "design a senolytic",
];

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * Cmd+K / Ctrl+K command palette. Searches all 12 routes plus canned
 * Oracle prompts (which navigate to /oracle?prompt=…). Enter selects,
 * Escape closes.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!openRef.current);
        return;
      }
      if (event.key === "Escape" && openRef.current) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  if (!open) return null;

  function navigate(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-6 pt-[14vh]">
      <div
        className="absolute inset-0 bg-abyss/75 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <Command
        label="Geistloom command palette"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-charcoal bg-abyss-2 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <CommandInput
          autoFocus
          placeholder="Search routes, or ask the Oracle…"
          className="h-12 border-b border-charcoal bg-transparent px-4 text-sm text-star-white placeholder:text-mist/60 focus:outline-none"
        />
        <CommandList className="max-h-[46vh] overflow-y-auto p-2">
          <CommandEmpty className="px-4 py-6 text-center text-sm text-mist">
            Nothing in the world-frame matches.
          </CommandEmpty>
          <CommandGroup heading="Routes" className="text-mist">
            {ROUTES.map((route) => (
              <CommandItem
                key={route.href}
                value={`${route.label} ${route.href} ${route.blurb}`}
                onSelect={() => navigate(route.href)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-star-white aria-selected:bg-charcoal"
              >
                <RouteIcon className="h-4 w-4 shrink-0 text-bio-teal" aria-hidden />
                <span className="shrink-0 font-medium">{route.label}</span>
                <span className="truncate text-xs text-mist">{route.blurb}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Oracle prompts" className="text-mist">
            {ORACLE_PROMPTS.map((prompt) => (
              <CommandItem
                key={prompt}
                value={`ask the oracle ${prompt}`}
                onSelect={() => navigate(`/oracle?prompt=${encodeURIComponent(prompt)}`)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-star-white aria-selected:bg-charcoal"
              >
                <Wand2 className="h-4 w-4 shrink-0 text-genome-violet" aria-hidden />
                <span>
                  Ask: <span className="text-bio-teal">&ldquo;{prompt}&rdquo;</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
