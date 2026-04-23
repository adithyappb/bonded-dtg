import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  experimental: {
    externalDir: true,
  },
  eslint: {
    dirs: ["app", "components", "lib"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  webpack: (config) => {
    // Robustness: explicitly add project node_modules to resolution paths.
    // This helps Next.js find its own compiled dependencies when building
    // in an external distDir.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
