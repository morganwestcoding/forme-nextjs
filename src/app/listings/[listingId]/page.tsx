

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservations from "@/app/actions/getReservations";
import getPosts from "@/app/actions/getPost";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ListingClient from "./ListingClient";
import ClientOnly from "@/components/ClientOnly";

interface IParams {
  listingId?: string;
}

export const dynamic = 'force-dynamic';

const ListingPage = async ({ params }: { params: IParams }) => {

  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();
  const posts = await getPosts({ listingId: params.listingId });

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
      />
    </ClientProviders>
  );
}
 
export default ListingPage;