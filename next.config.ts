import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',                  // Specifies where the service worker files will be generated
  disable: process.env.NODE_ENV === 'development', // Disable in development to avoid aggressive caching loops
  register: true,                  // Automatically register the service worker
  sw:'sw.js'
});
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   allowedDevOrigins: ['192.168.1.13'],
   turbopack: {}, 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'atplc20.pythonanywhere.com',
        port: '',
        pathname: '/media/**', // Allows any media files coming out of the server storage bucket
      },
    ],
  },
  experimental: {
    // 💡 Fixes the Call retries exceeded memory crash by restricting concurrent workers
    cpus: 1,
    workerThreads: false,
  }
};

export default withPWA(nextConfig);
