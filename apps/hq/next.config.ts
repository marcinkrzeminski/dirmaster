import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["db", "cache", "shared", "ui"],
  output: "standalone",
};

export default nextConfig;
