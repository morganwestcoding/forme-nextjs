'use client';

import { useMemo } from "react";
import { SafeListing, SafeReservation, SafeUser, SafeService, SafePost, SafeReview } from "@/app/types";

import Container from "@/components/Container";
import ListingHead from "@/components/listings/ListingHead";

interface ListingClientProps {
  listing: SafeListing & {
    user: SafeUser;
    services: SafeService[];
  };
  currentUser?: SafeUser | null;
  reservations?: SafeReservation[];
  posts?: SafePost[];
  reviews?: SafeReview[];
  reviewStats?: {
    totalCount: number;
    averageRating: number;
  };
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser,
  reservations = [],
  posts = [],
  reviews = [],
  reviewStats,
}) => {
  // disabledDates kept if you use them elsewhere
  const disabledDates = useMemo(() => {
    const dates: Date[] = [];
    reservations.forEach((r: any) => {
      if (r.date) dates.push(new Date(r.date));
    });
    return dates;
  }, [reservations]);

  return (
    <Container>
      <ListingHead
        key={`${listing.id}-${listing.imageSrc}-${(listing.galleryImages || []).join('|')}`}
        listing={listing}
        currentUser={currentUser}
        Services={listing.services}
        posts={posts}
        reviews={reviews}
        reviewStats={reviewStats}
      />
    </Container>
  );
}

export default ListingClient;
