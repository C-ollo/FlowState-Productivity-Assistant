import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to fix build issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
