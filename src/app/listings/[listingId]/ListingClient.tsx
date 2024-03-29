'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { categories } from "@/components/Categories";
import ListingHead from "@/components/listings/ListingHead";
import ListingInfo from "@/components/listings/ListingInfo";
import ListingReservation from "@/components/listings/ListingReservation";
import ListingRightBar from "@/components/listings/ListingRightBar";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection'
};

interface ListingClientProps {
  reservations?: SafeReservation[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  reservations = [],
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  // New state for tracking selected services
  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [totalPrice, setTotalPrice] = useState(0);

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

  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  const handleServiceSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = event.target.value;
    toggleServiceSelection(serviceId);
  };

  // New toogle ServieSelection
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
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id
      })
      .then(() => {
        toast.success('Listing reserved!');
        setDateRange(initialDateRange);
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
    dateRange, 
    listing?.id,
    router,
    currentUser,
    loginModal
  ]);

  {/*useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInDays(
        dateRange.endDate, 
        dateRange.startDate
      );
      
      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);*/}

  return ( 
    <div>
      <div className="flex w-full" >
        <div className="flex-none w-[45%] ml-28">
          <div className="rounded-2xl shadow-sm bg-[#ffffff]">
        <ListingInfo
              id={listing.id}
              title={listing.title}
              user={listing.user}
              category={category}
              description={listing.description}
              locationValue={listing.locationValue}
              services={listing.services} 
            />
       <div className="rounded-2xl shadow-sm bg-[#ffffff] p-6 -mt-4">
            <h3 className="font-bold mb-4">Services<hr className="mt-2"/></h3>
            
            {listing.services.map((service) => (
              <div key={service.id} className="flex justify-between items-center mb-2 text-sm">
                <span>{service.serviceName} ${service.price}</span>
                <button
                  className="bg-white rounded-lg shadow-sm border text-[#8d8d8d] hover:bg-[#b1dafe] hover:text-white font-normal py-2 px-4"
                  onClick={() => toggleServiceSelection(service.id)}
                >
                  {selectedServices.has(service.id) ? "Deselect" : "Select"}
                </button>
              </div>
            ))}
        

            <ListingReservation
                price={totalPrice}
                
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading}
  disabledDates={disabledDates}
                />
                </div>
                </div>

          </div>
          <div className="flex-grow w-[45%] ml-3">
          <ListingRightBar
          description={listing.description}
            listing={listing}
            selectedServices={selectedServices}
            toggleServiceSelection={toggleServiceSelection}
            totalPrice={totalPrice}
            dateRange={dateRange}
            onCreateReservation={onCreateReservation}
            isLoading={isLoading}
            disabledDates={disabledDates}
          />
            </div>
          </div>
        </div>

   );
}
 
export default ListingClient;