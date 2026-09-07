/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    // pdfkit reads its standard font metrics from disk at runtime (relative to its own __dirname), so it must
    // stay an external package and its data files must be traced into the documents function.
    serverComponentsExternalPackages: ['pdfkit'],
    outputFileTracingIncludes: {
      '/api/documents/[type]': ['./node_modules/pdfkit/js/**'],
      '/api/documents/[type]/route': ['./node_modules/pdfkit/js/**'],
    },
  },
}

module.exports = nextConfig
