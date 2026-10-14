import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "teal" | "violet" | "amber" | "mist" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
}

const TONES: Record<BadgeTone, string> = {
  teal: "bg-bio-teal/10 text-bio-teal border border-bio-teal/30",
  violet: "bg-genome-violet/10 text-genome-violet border border-genome-violet/30",
  amber: "bg-helix-amber/10 text-helix-amber border border-helix-amber/30",
  mist: "bg-charcoal/60 text-mist border border-charcoal",
  outline: "border border-charcoal text-mist",
};

export function Badge({ tone = "mist", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] tracking-wide",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
