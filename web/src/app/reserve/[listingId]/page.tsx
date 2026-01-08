import { redirect } from 'next/navigation';
import getListingById from '@/app/actions/getListingById';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ReservationFlow from '@/components/reservation/ReservationFlow';

interface ReservePageProps {
  params: { listingId: string };
  searchParams: { serviceId?: string; employeeId?: string };
}

export default async function ReservePage({ params, searchParams }: ReservePageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/`);
  }

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
