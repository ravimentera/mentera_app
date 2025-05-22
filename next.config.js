/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  // For Vercel deployment
  swcMinify: true,
};

module.exports = nextConfig;
