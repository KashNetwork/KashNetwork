import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // keep native / wasm DB packages out of the webpack bundle
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  outputFileTracingIncludes: {
    '/api/**': ['./supabase/migrations/**'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

export default nextConfig;
