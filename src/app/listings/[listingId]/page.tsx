import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";
import getPosts from "@/app/actions/getPost";
import getReviews from "@/app/actions/getReviews";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ListingClient from "./ListingClient";

interface IParams {
  listingId?: string;
}

export const dynamic = 'force-dynamic';

const ListingPage = async ({ params }: { params: IParams }) => {

  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();
  const posts = await getPosts({ listingId: params.listingId });

  // Fetch reviews for this listing
  const reviewsData = listing ? await getReviews({
    targetType: 'listing',
    targetListingId: listing.id,
  }) : { reviews: [], totalCount: 0, averageRating: 0, ratingDistribution: [] };

  if (!listing) {
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <ListingClient
        listing={listing}
        reservations={reservations}
        currentUser={currentUser}
        posts={posts}
        reviews={reviewsData.reviews}
        reviewStats={{
          totalCount: reviewsData.totalCount,
          averageRating: reviewsData.averageRating,
        }}
      />
    </ClientProviders>
  );
}
 
export default ListingPage;