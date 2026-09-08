/** @type {import('next').NextConfig} */

// pdfkit reads its standard font metrics (.afm) from disk at runtime, relative to its own
// __dirname, so it must stay an external package and its data files have to be traced into
// every serverless function that renders a PDF. That is not only the download routes: the
// "email this quotation" server action builds the PDF inside the page's own function, so the
// pages that own those actions need the files too. Missing them fails at doc.font('Helvetica').
const PDFKIT = ['./node_modules/pdfkit/js/**']
const PDF_ROUTES = [
  '/api/documents/[type]',
  '/api/documents/[type]/route',
  '/api/billing/[id]/pdf',
  '/api/billing/[id]/pdf/route',
  '/agency/billing/[kind]/[id]',
  '/agency/billing/[kind]/[id]/page',
  '/(platform)/agency/billing/[kind]/[id]/page',
  '/agency/clients/[id]',
  '/agency/clients/[id]/page',
  '/(platform)/agency/clients/[id]/page',
]

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
    serverComponentsExternalPackages: ['pdfkit'],
    outputFileTracingIncludes: Object.fromEntries(PDF_ROUTES.map((route) => [route, PDFKIT])),
  },
}

module.exports = nextConfig
