import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
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
  const currentUser = await getCurrentUser();

  // Independent providers don't have real storefronts — the Listing row is just
  // a hidden shell auto-created so their services have somewhere to live. Anyone
  // landing on its URL gets bounced to the worker's profile, which is the real
  // public surface for them.
  const listing = await getListingById(params);
  if (listing?.employees?.some((e) => e.isIndependent)) {
    redirect(`/profile/${listing.userId}`);
  }

  return (
    <ClientProviders>
      <ListingClient
        listingId={params.listingId}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
}

export default ListingPage;
