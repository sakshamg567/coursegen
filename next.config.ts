import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["esbuild", "vm2"],
  },
  serverExternalPackages: ["esbuild", "vm2"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
