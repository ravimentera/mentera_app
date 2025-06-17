/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  // For Vercel deployment
  swcMinify: true,
  images: {
    domains: ["randomuser.me"],
  },
};

module.exports = nextConfig;
