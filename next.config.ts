import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
    WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY,
    STORE_NOTIFY_PHONE: process.env.STORE_NOTIFY_PHONE,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
