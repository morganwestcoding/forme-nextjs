// app/favorites/page.tsx
import React from 'react';
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getFavoriteListings from "@/app/actions/getFavoriteListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import FavoritesClient from "./FavoritesClient";

interface FavoritesPageProps {
  searchParams: {
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

const FavoritesPage = async ({ searchParams }: FavoritesPageProps) => {
  const currentPage = Number(searchParams?.page) || 1;
  const listings = await getFavoriteListings();
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No favorites found"
          subtitle="Looks like you have no favorite listings."
        />
      </ClientOnly>
    );
  }

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginatedListings = listings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <ClientOnly>
      <FavoritesClient 
        listings={paginatedListings}
        currentUser={currentUser}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={listings.length}
      />
    </ClientOnly>
  );
}

export default FavoritesPage;