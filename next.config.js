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
    // pdfkit reads its standard font metrics from disk at runtime; make sure they ship with the function.
    outputFileTracingIncludes: {
      '/api/documents/[type]': ['./node_modules/pdfkit/js/data/**'],
    },
  },
}

module.exports = nextConfig
