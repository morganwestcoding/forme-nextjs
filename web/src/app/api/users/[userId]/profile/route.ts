import { NextResponse } from "next/server";
import getProfileById from "@/app/actions/getProfileById";
import getListings from "@/app/actions/getListings";
import getPosts from "@/app/actions/getPost";
import getReviews from "@/app/actions/getReviews";
import getServicesByUserId from "@/app/actions/getServicesByUserId";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  const user = await getProfileById(params);
  if (!user) return NextResponse.json(null, { status: 404 });

  const [listings, posts, services, reviewsData] = await Promise.all([
    getListings({ ...params, includeEmployedBy: true }),
    getPosts(params),
    getServicesByUserId(user.id),
    getReviews({ targetType: 'user', targetUserId: user.id }),
  ]);

  return NextResponse.json({
    user,
    listings,
    posts,
    services,
    reviews: reviewsData.reviews,
    reviewStats: {
      totalCount: reviewsData.totalCount,
      averageRating: reviewsData.averageRating,
    },
  });
}
