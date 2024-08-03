import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        imageSrc: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        following: true,
        followers: true,
      },
    });

    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: {
        services: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const results = [
      ...users.map(user => ({
        ...user,
        type: 'user' as const,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() || null,
      })),
      ...listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        imageSrc: listing.imageSrc,
        category: listing.category,
        location: listing.location,
        createdAt: listing.createdAt.toISOString(),
        userId: listing.userId,
        services: listing.services,
        user: listing.user,
        type: 'listing' as const,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'An error occurred while searching' }, { status: 500 });
  }
}