/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configura dominios permitidos para imágenes, incluyendo Supabase Storage
  images: {
    domains: ['hukcbmpbfqsgevhiglkz.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hukcbmpbfqsgevhiglkz.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  // Configuración para manejar correctamente APIs con archivos
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
};

export default nextConfig;
