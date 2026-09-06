import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GoldOak Insurance Solutions',
    short_name: 'GoldOak',
    description: 'Understand the risk first. The policy comes after. Track your cover, quotes and claims with GoldOak.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f4ec',
    theme_color: '#073423',
    lang: 'en-KE',
    icons: [{ src: '/assets/Gold Icon.png', sizes: '500x500', type: 'image/png', purpose: 'any' }],
  }
}
