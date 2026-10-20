import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

/**
 * The three families are self-hosted, not fetched from Google at build time.
 *
 * `next/font/google` downloads the font CSS while the app builds, which makes
 * the build depend on a network call that has nothing to do with the change
 * being built. When that call fails the build dies with `An error occurred in
 * next/font` and a null-pointer inside webpack - a failure that looks like a
 * code error and is not one. It has already reddened a dependabot PR here
 * whose diff touched nothing to do with fonts.
 *
 * These are the same families, the same latin subset, served as the variable
 * fonts the Google API would have handed the build anyway, committed under
 * `app/fonts` with their OFL licences next to them.
 */
const display = localFont({
  src: "./fonts/SpaceGrotesk-latin.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-display",
});

const body = localFont({
  src: "./fonts/Inter-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-body",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono-latin.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Geistloom — the world-frame where superintelligence solves aging",
    template: "%s | Geistloom",
  },
  description:
    "An open-source observatory for the biotech century: a deterministic superintelligence Oracle, a 200-year world simulation engine, and a time machine for every simulated state. Zero API keys.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Geistloom — the world-frame where superintelligence solves aging",
    description:
      "Ask the Oracle to solve aging. Apply the intervention. Watch 200 years of the world unfold — then replay any state.",
    type: "website",
    images: [{ url: "/images/og.svg", width: 1200, height: 630, alt: "Geistloom" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geistloom — the world-frame where superintelligence solves aging",
    description: "Deterministic superintelligence simulation. Zero API keys.",
    images: ["/images/og.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070b12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen bg-abyss text-star-white antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <AppShell>{children}</AppShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
