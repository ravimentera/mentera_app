/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  // For Vercel deployment
  swcMinify: true,
  images: {
    // Use remotePatterns for more robust external image handling
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/**",
      },
    ],
    // Keep domains for backward compatibility
    domains: ["randomuser.me"],
    // Add formats for better compatibility
    formats: ["image/webp", "image/avif"],
    // Increase the limit for deployment environments
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add additional settings for deployment compatibility
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization if needed in certain environments
    unoptimized: false,
  },
};

module.exports = nextConfig;
