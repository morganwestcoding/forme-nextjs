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


interface ListingClientProps {
  reservations?: SafeReservation[];
  location: string;
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  location,
  reservations = [],
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  // New state for tracking selected services
  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [totalPrice, setTotalPrice] = useState(0);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('8:00 AM');

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
        date,
        time,
        listingId: listing?.id
      })
      .then(() => {
        toast.success('Listing reserved!');
        setDate(new Date()); // Reset date
        setTime('8:00 AM'); // Reset time
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
              location={listing.location || "Default Location"}
              services={listing.services} 
            />
       <div className="rounded-2xl shadow-sm bg-[#ffffff] px-6 -mt-4">
            <h3 className="font-bold mb-2 mt-2">Services</h3>
            
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
        <hr className="-mx-6 mt-6 mb-5"/>
        <h3 className="font-bold mb-4">Date</h3>
            <ListingReservation
                price={totalPrice}
                date={date}
                time={time}
                totalPrice={totalPrice}
                onChangeDate={setDate}
                onChangeTime={setTime}
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