import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic routes with Firebase require server-side rendering
  // Cannot use static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
