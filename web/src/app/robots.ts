import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forme.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/bookings/', '/settings/', '/properties/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
