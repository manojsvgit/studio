import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['https://6000-firebase-studio-1750071303689.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev'],
  experimental: {
    // Any other experimental features would go here
  },
};

export default nextConfig;
