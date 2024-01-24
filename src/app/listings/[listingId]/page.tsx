
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";

import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";

import ListingClient from "./ListingClient";

interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {

  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();

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
        /*reservations={reservations}*/
        currentUser={currentUser}
      />
    </ClientProviders>
  );
}
 
export default ListingPage;