import type { NextConfig } from "next";

// Standalone output powers the self-hosted Docker/Fly/Railway images, but
// its traced-file copy needs symlink privileges that default Windows
// sessions do not grant — so the Docker build sets GEISTLOOM_STANDALONE=1
// and desktop/CI-linux/Vercel builds skip it.
const standalone = process.env.GEISTLOOM_STANDALONE === "1";

const nextConfig: NextConfig = {
  ...(standalone ? { output: "standalone" as const } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.vercel.app" }],
  },
  env: {
    NEXT_PUBLIC_SIM_SEED: process.env.NEXT_PUBLIC_SIM_SEED ?? "4093",
  },
};

export default nextConfig;
