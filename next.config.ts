import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack due to stability issues
  // turbopack: false,
  reactCompiler: true,
};

export default nextConfig;
