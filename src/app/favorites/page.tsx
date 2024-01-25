
import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getFavoriteListings from "@/app/actions/getFavoriteListings";

import FavoritesClient from "./FavoritesClient";

const ListingPage = async () => {
  const listings = await getFavoriteListings();
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientProviders>
        <EmptyState
          title="No favorites found"
          subtitle="Looks like you have no favorite listings."
        />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <FavoritesClient
        listings={listings}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
}
 
export default ListingPage;