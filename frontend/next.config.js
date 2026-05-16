/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  },
  
  // API rewrites for convenience (optional - requests already proxy via routes)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return {
        beforeFiles: [
          // This is optional since we have explicit proxy routes
          // but can be useful for debugging
        ],
      };
    }
    return {};
  },
};

module.exports = nextConfig;
