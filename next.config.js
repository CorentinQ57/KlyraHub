/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost', 
      'supabase.io', 
      'supabase.com',
      'ecfccsjjfrweqzhkveku.supabase.co'  // Ajout du domaine Supabase du projet
    ],
  },
  // Optimisation du préchargement des ressources
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui', '@heroicons', 'lucide-react'],
  },
  // Configuration du préchargement des pages
  onDemandEntries: {
    // Période pendant laquelle les pages compilées sont conservées en mémoire
    maxInactiveAge: 60 * 1000, // 1 minute
    // Nombre maximum de pages à conserver en mémoire
    pagesBufferLength: 5,
  },
  // Configuration du comportement des ressources statiques
  staticPageGenerationTimeout: 120,
  compiler: {
    // Suppression des console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // Forcer le port 3000
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}

module.exports = nextConfig 