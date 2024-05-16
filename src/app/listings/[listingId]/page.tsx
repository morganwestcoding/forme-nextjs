

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ListingClient from "./ListingClient";
import ClientOnly from "@/components/ClientOnly";

interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {

  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ListingClient
        listing={listing}
        reservations={reservations}
        currentUser={currentUser}
        location={listing.location || "Default Location"} 
      />
    </ClientOnly>
  );
}
 
export default ListingPage;