import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Static export disabled due to dynamic routes with Firebase
  // For Hostinger shared hosting, you'll need VPS or deploy to Vercel
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
