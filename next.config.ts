import type { NextConfig } from 'next';

// STATIC_EXPORT=1 produces a dependency-free static build in ./out
// (used by `npm run export`; see scripts/make-standalone.mjs).
const isExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isExport ? { output: 'export' as const, images: { unoptimized: true } } : {}),
};

export default nextConfig;
