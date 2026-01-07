/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Force fresh builds - PERMANENT FIX
  // Unique build ID forces Next.js to regenerate all assets including CSS
  generateBuildId: async () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `build-${timestamp}-${random}-v2.3-clean-ui`;
  },
  // Disable cache during build to avoid issues
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Force CSS to be fresh
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
};

export default nextConfig;

