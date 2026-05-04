import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListingById from '@/app/actions/getListingById';
import ListingFlow from '@/components/listing/ListingFlow';

interface IParams {
  listingId: string;
}

export async function generateMetadata({ params }: { params: IParams }): Promise<Metadata> {
  const listing = await getListingById(params).catch(() => null);
  return {
    title: listing ? `Edit ${listing.title}` : 'Edit Listing',
    description: 'Update your listing details',
    robots: { index: false, follow: false },
  };
}

export default async function EditListingPage({ params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  const listing = await getListingById(params);

  if (!listing) {
    redirect('/properties');
  }

  // Check authorization: must be owner or admin/master
  const isOwner = listing.userId === currentUser.id;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'master';

  if (!isOwner && !isAdmin) {
    redirect(`/listings/${params.listingId}`);
  }

  return (
    <ListingFlow
      mode="edit"
      listingId={params.listingId}
      initialData={listing}
    />
  );
}
