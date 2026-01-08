// app/api/search/users/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function GET(request: Request) {
  // Add authentication for employee selection
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  // Support both 'term' and 'q' for compatibility
  const term = searchParams.get('term') || searchParams.get('q');

  if (!term || term.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } }, // Exclude current user
          {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        imageSrc: true, // Add this for profile images
      },
      take: 10, // Limit results for performance
    });

    // Return in wrapped format for consistency
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}