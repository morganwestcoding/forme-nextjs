'use client';

import { useMemo, useState } from "react";
import { SafeListing, SafeReservation, SafeUser, SafeService, SafePost } from "@/app/types";

import Container from "@/components/Container";
import ListingHead from "@/components/listings/ListingHead";
import ReservationModal from "@/components/modals/ReservationModal";
import RentModal from "@/components/modals/ListingModal"; // mount so Edit works on this page too

interface ListingClientProps {
  listing: SafeListing & {
    user: SafeUser;
    services: SafeService[];
  };
  currentUser?: SafeUser | null;
  reservations?: SafeReservation[];
  posts?: SafePost[];
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser,
  reservations = [],
  posts = [],
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
      <div className="max-w-screen-lg">
        <div className="flex flex-col">
<ListingHead
  key={`${listing.id}-${listing.imageSrc}-${(listing.galleryImages || []).join('|')}`}
  listing={listing}
  currentUser={currentUser}
  Services={listing.services}
  posts={posts}
/>
        </div>
      </div>
    </Container>
  );
}

export default ListingClient;
