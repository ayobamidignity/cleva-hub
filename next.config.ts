import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if lint errors exist
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: only if you also want TS type warnings to not block Vercel
    // ignoreBuildErrors: false,
  },
};

export default nextConfig;