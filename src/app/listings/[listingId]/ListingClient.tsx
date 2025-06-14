'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';
import axios from "axios";
import toast from "react-hot-toast";
import { Range } from "react-date-range";

import { SafeListing, SafeReservation, SafeUser, SafeService } from "@/app/types";
import { categories } from "@/components/Categories"; // Import categories

import Container from "@/components/Container";
import ListingHead from "@/components/listings/ListingHead";
import ServicesSection from "@/components/listings/ServiceSection";
import ReservationModal from "@/components/modals/ReservationModal";

export interface SelectedService {
  value: string;
  label: string;
  price: number;
}

export interface SelectedEmployee {
  value: string;
  label: string;
}

interface ListingClientProps {
  listing: SafeListing & {
    user: SafeUser;
    services: SafeService[];
  };
  currentUser?: SafeUser | null;
  reservations?: SafeReservation[];
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser,
  reservations = [],
}) => {
  const router = useRouter();
  
  // Add state for service selection
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);
  
  // Find category object that matches listing.category
  const categoryInfo = useMemo(() => {
    const foundCategory = categories.find(item => item.label === listing.category);
    return foundCategory ? {
      label: foundCategory.label,
      description: foundCategory.description || 'No description available'
    } : {
      label: listing.category || 'Uncategorized',
      description: 'No description available'
    };
  }, [listing.category]);

  // Handle null or undefined location
  const locationString = useMemo(() => {
    return listing.location || 'Location not specified';
  }, [listing.location]);

  const isOwner = useMemo(() => {
    if (!currentUser || !listing?.user) {
      return false;
    }

    return currentUser.id === listing.user.id;
  }, [currentUser, listing.user]);

  // Get disabled dates from reservations
  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation: any) => {
      if (reservation.date) {
        const date = new Date(reservation.date);
        dates.push(date);
      }
    });

    return dates;
  }, [reservations]);

  // Handle service selection
  const onServiceSelect = useCallback((serviceId: string, serviceName: string, price: number) => {
    setSelectedService({
      id: serviceId,
      name: serviceName,
      price: price
    });
    setIsReservationModalOpen(true);
  }, []);

  return (
    <Container>
      <div className="max-w-screen-lg">
        <div className="flex flex-col">
        <ListingHead
  listing={listing}
  currentUser={currentUser}
  Services={listing.services}
/>
        </div>
      </div>
      
      {isReservationModalOpen && selectedService && (
        <ReservationModal />
      )}
    </Container>
  );
}
 
export default ListingClient;