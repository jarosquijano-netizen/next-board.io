/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Generate unique build ID to force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
  // Disable static optimization to force server-side rendering
  experimental: {
    ...nextConfig.experimental,
    forceSwcTransforms: true,
  },
};

export default nextConfig;

