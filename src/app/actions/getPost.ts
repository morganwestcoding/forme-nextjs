// src/app/actions/getPosts.ts
import prisma from "@/app/libs/prismadb";
import { Service } from "@prisma/client";

interface QueryParams {
  userId?: string;
  category?: string;
  locationValue?: string;
  services?: { some: { id: { in: string[] } } };
  createdAt?: { gte: Date; lte: Date };
}

export interface IPostsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  services?: Service[];
}

export default async function getPosts(params: IPostsParams) {
  try {
    const { userId, locationValue, startDate, endDate, category, services } = params;

    let query: QueryParams = {};
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (services && services.length > 0) {
      query.services = { some: { id: { in: services.map(service => service.id) } } };
    }
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const posts = await prisma.post.findMany({
      where: query,
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      imageSrc: post.imageSrc || undefined, // Convert null to undefined
      location: post.location || undefined, // Convert null to undefined
      user: {
        ...post.user,
        createdAt: post.user.createdAt.toISOString(),
        updatedAt: post.user.updatedAt.toISOString(),
        emailVerified: post.user.emailVerified ? post.user.emailVerified.toISOString() : null
      }
    }));
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}
