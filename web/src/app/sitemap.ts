import { MetadataRoute } from 'next';
import prisma from '@/app/libs/prismadb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forme.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic: public listings
  const listings = await prisma.listing.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic: public profiles
  const users = await prisma.user.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  const profilePages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/profile/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic: public shops
  const shops = await prisma.shop.findMany({
    select: { id: true, updatedAt: true },
    where: { shopEnabled: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  const shopPages: MetadataRoute.Sitemap = shops.map((shop) => ({
    url: `${baseUrl}/shops/${shop.id}`,
    lastModified: shop.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...listingPages, ...profilePages, ...shopPages];
}
