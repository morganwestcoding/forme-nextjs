import type { Metadata } from 'next';
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";
import getPosts from "@/app/actions/getPost";
import getReviews from "@/app/actions/getReviews";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ListingClient from "./ListingClient";
import JsonLd, { localBusinessSchema, breadcrumbSchema } from "@/components/seo/JsonLd";

interface IParams {
  listingId?: string;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: IParams }): Promise<Metadata> {
  const listing = await getListingById(params);
  if (!listing) return { title: 'Listing Not Found' };

  const description = listing.description
    ? listing.description.slice(0, 160)
    : `Book ${listing.category} services at ${listing.title} on ForMe.`;

  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      ...(listing.imageSrc ? { images: [{ url: listing.imageSrc }] } : {}),
    },
  };
}

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forme.app';

  return (
    <ClientProviders>
      <JsonLd data={localBusinessSchema({
        title: listing.title,
        description: listing.description,
        imageSrc: listing.imageSrc,
        category: listing.category,
        address: listing.address,
        location: listing.location,
        rating: listing.rating,
        ratingCount: listing.ratingCount,
        phoneNumber: listing.phoneNumber,
        website: listing.website,
        url: `${baseUrl}/listings/${listing.id}`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: listing.category || 'Listings', url: `${baseUrl}/?category=${listing.category}` },
        { name: listing.title, url: `${baseUrl}/listings/${listing.id}` },
      ])} />
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