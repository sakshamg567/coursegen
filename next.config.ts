import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["esbuild", "vm2"],
  },
  serverExternalPackages: ["esbuild", "vm2"],
};

export default nextConfig;
