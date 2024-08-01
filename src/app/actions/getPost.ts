import prisma from "@/app/libs/prismadb";

export interface IPostsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getPosts(
  params: IPostsParams
) {
  try {
    const { userId, locationValue, startDate, endDate, category } = params;

    let query: any = {};

    if (userId) query.userId = userId;

    if (category) query.category = category;

    if (locationValue) query.locationValue = locationValue;

    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

   
    const posts = await prisma.post.findMany({
      where: query,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const safePosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      likes: post.likes || [],
      bookmarks: post.bookmarks || [],
      user: {
        id: post.user?.id || 'default-id',
        image: post.user?.image || '/default-profile.jpg',
        name: post.user?.name || 'Anonymous',
        email: post.user?.email ?? null,
        bio: post.user?.bio || "No Bio Provided Yet..",
        location: post.user?.location ?? null,
        imageSrc: post.user?.imageSrc || '/assets/hero-background.jpeg',
        createdAt: post.user?.createdAt.toISOString() || new Date().toISOString(),
        updatedAt: post.user?.updatedAt.toISOString() || new Date().toISOString(),
        emailVerified: post.user?.emailVerified ? post.user.emailVerified.toISOString() : null,
        galleryImages: post.user?.galleryImages || [],
      },
    }));

    
    return safePosts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}
