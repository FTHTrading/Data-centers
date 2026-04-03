/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
