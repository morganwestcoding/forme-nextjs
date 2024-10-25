'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { eachDayOfInterval } from 'date-fns';

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { categories } from "@/components/Categories";
import ListingHead from "@/components/listings/ListingHead";
import ListingRightBar from "@/components/listings/ListingRightBar";
import StoreHours from "@/components/listings/StoreHours";

interface ListingClientProps {
  reservations?: SafeReservation[];
  location: string;
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

export const dynamic = 'force-dynamic';

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  location,
  reservations = [],
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [totalPrice, setTotalPrice] = useState(0);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('8:00 AM');
  const [isLoading, setIsLoading] = useState(false);

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];
    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate)
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservations]);

  const category = useMemo(() => {
    return categories.find((items) => 
     items.label === listing.category);
  }, [listing.category]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(serviceId)) {
        newSelected.delete(serviceId);
      } else {
        newSelected.add(serviceId);
      }
      return newSelected;
    });
  };

  useEffect(() => {
    const newTotalPrice = listing.services
      .filter(service => selectedServices.has(service.id))
      .reduce((sum, service) => sum + service.price, 0);
    setTotalPrice(newTotalPrice);
  }, [selectedServices, listing.services]);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    setIsLoading(true);

    axios.post('/api/reservations', {
      totalPrice,
      date,
      time,
      listingId: listing?.id
    })
    .then(() => {
      toast.success('Listing reserved!');
      setDate(new Date());
      setTime('8:00 AM');
      router.push('/trips');
    })
    .catch(() => {
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
    })
  },
  [
    totalPrice,
    date,
    time,
    listing?.id,
    router,
    currentUser,
    loginModal
  ]);

  return ( 
    <div className="max-w-[1280px] mx-auto px-4">
      <div className="flex justify-between items-start mt-8">
        <div className="w-[65%] pl-20">
          <ListingHead 
            listing={listing}
            currentUser={currentUser}
          />
        </div>
        <div className="w-[40%]">
          <ListingRightBar
            description={listing.description}
            listing={listing}
            selectedServices={selectedServices}
            toggleServiceSelection={toggleServiceSelection}
            totalPrice={totalPrice}
            onCreateReservation={onCreateReservation}
            isLoading={isLoading}
            disabledDates={disabledDates}
            currentUser={currentUser}
            reservations={reservations}
          />
        </div>
      </div>
    </div>
  );
}
 
export default ListingClient;