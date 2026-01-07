/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    forceSwcTransforms: true,
  },
  // Generate unique build ID to force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
};

export default nextConfig;

