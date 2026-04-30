import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ForMe — Your Complete Business Ecosystem',
    short_name: 'ForMe',
    description:
      'Book services, manage your business, and grow your professional presence — all in one platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#0c0a09',
    icons: [
      {
        src: '/logos/fm-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/black.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
