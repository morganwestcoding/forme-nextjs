'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { eachDayOfInterval } from 'date-fns';

import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { categories } from "@/components/Categories";
import ListingHead from "@/components/listings/ListingHead";
import ListingRightBar from "@/components/listings/ListingRightBar";
import Container from "@/components/Container";
import HeartButton from "@/components/HeartButton";

export interface SelectedEmployee {
  value: string;
  label: string;
}

export interface SelectedService {
  value: string;
  label: string;
  price?: number;
}

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
  const rentModal = useRentModal();
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = currentUser?.id === listing.userId;

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

  const toggleServiceSelection = useCallback((serviceId: string) => {
    setSelectedServices(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(serviceId)) {
        newSelected.delete(serviceId);
      } else {
        newSelected.clear(); // Clear any existing selection
        newSelected.add(serviceId);
      }
      return newSelected;
    });
  }, []);

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

    if (!date || !time || !selectedService || !selectedEmployee) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    axios.post('/api/reservations', {
      totalPrice,
      date,
      time,
      listingId: listing?.id,
      serviceId: selectedService.value,
      serviceName: listing.services.find(service => 
        service.id === selectedService.value
      )?.serviceName,
      employeeId: selectedEmployee.value,
      note: ''
    })
    .then(() => {
      toast.success('Reservation created successfully!');
      setDate(null);
      setTime('');
      setSelectedService(null);
      setSelectedEmployee(null);
      setSelectedServices(new Set());
      router.push('/trips');
    })
    .catch((error) => {
      toast.error(error.response?.data || 'Something went wrong creating your reservation.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [
    totalPrice,
    date,
    time,
    listing?.id,
    selectedService,
    selectedEmployee,
    listing.services,
    router,
    currentUser,
    loginModal
  ]);

  const handleServiceChange = useCallback((service: SelectedService) => {
    setSelectedService(service);
    setSelectedServices(new Set([service.value]));
  }, []);

  const handleEmployeeChange = useCallback((employee: SelectedEmployee) => {
    setSelectedEmployee(employee);
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate);
    setTime('');
  }, []);

  const handleTimeChange = useCallback((newTime: string) => {
    setTime(newTime);
  }, []);

  return ( 
    <Container>
      <div className="max-w-full">
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex gap-6">
            {/* Left column - ListingHead and About Us stacked */}
            <div className="w-[60%] flex flex-col gap-4">
              {/* ListingHead at original width */}
              <ListingHead 
                listing={listing}
                currentUser={currentUser}
              />
              
              {/* About Us section directly beneath ListingHead */}
              <div className="w-full bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-black">About Us</h2>
                  
                  {/* Action Buttons in the Top Right */}
                  <div className="flex items-center gap-2">
                    <HeartButton 
                      variant='listingHead' 
                      listingId={listing.id} 
                      currentUser={currentUser}
                      favoriteIds={listing.favoriteIds} 
                    />
                    
                    {/* Share Button */}
                    <div className="flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300
                      bg-gray-50 border border-gray-100
                      hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#52525B" fill="#ffffff">
                        <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Edit button only for owners */}
                    {isOwner && (
                      <button 
                        onClick={() => rentModal.onOpen(listing)}
                        className="bg-[#60A5FA] text-white py-2 px-4 rounded-md transition-all duration-300 
                          hover:shadow-md text-sm font-medium
                          flex items-center justify-center gap-2"
                      >
                        <span>Edit Listing</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-black mb-6">
                  {listing.description}
                </p>
                
                {/* Services Section */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-3">Services</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {listing.services.map(service => (
                      <div key={service.id} 
                          className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <h3 className="font-medium text-sm mb-1">{service.serviceName}</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">10min</span>
                          <span className="font-medium">${service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Booking section */}
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
                selectedService={selectedService}
                selectedEmployee={selectedEmployee}
                date={date}
                time={time}
                onServiceChange={handleServiceChange}
                onEmployeeChange={handleEmployeeChange}
                onDateChange={handleDateChange}
                onTimeChange={handleTimeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
 
export default ListingClient;