import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly variant?: "default" | "outline" | "elevated";
}

export function Card({ variant = "default", className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variant === "default" && "border border-charcoal bg-abyss-2",
        variant === "outline" && "border border-charcoal",
        variant === "elevated" &&
          "border border-charcoal bg-abyss-2 shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
        "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg font-semibold tracking-tight text-star-white", className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-mist", className)} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-2", className)} {...rest}>
      {children}
    </div>
  );
}
