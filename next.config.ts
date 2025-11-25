import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  },
  compress: true,
  output: 'standalone', // Required for Docker
};

export default nextConfig;
