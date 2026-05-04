import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import getListingById from '@/app/actions/getListingById';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ReservationFlow from '@/components/reservation/ReservationFlow';

interface ReservePageProps {
  params: { listingId: string };
  searchParams: { serviceId?: string; employeeId?: string };
}

export async function generateMetadata({ params }: { params: { listingId: string } }): Promise<Metadata> {
  const listing = await getListingById({ listingId: params.listingId }).catch(() => null);
  return {
    title: listing ? `Book ${listing.title}` : 'Reserve',
    description: 'Complete your booking',
    robots: { index: false, follow: false },
  };
}

export default async function ReservePage({ params, searchParams }: ReservePageProps) {
  // currentUser is now optional — guest checkout collects identity in-flow.
  const currentUser = await getCurrentUser();

  const listing = await getListingById({ listingId: params.listingId });

  if (!listing) {
    redirect('/');
  }

  return (
    <ReservationFlow
      listing={listing}
      currentUser={currentUser}
      initialServiceId={searchParams.serviceId}
      initialEmployeeId={searchParams.employeeId}
    />
  );
}
