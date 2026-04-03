/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3003', 'dc.unykorn.org', 'data.unykorn.org'],
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
