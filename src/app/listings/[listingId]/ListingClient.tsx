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
import Container from "@/components/Container";

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
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>('');
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
          {/* Full-width ListingHead */}
          <div className="w-full">
            <ListingHead 
              listing={listing}
              currentUser={currentUser}
            />
          {/* About Us and Booking section side by side */}
          <div className="flex gap-6 mt-6">
            {/* About Us section */}
            <div className="w-[60%] bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-2">About Us</h2>
              <p className="text-sm text-black">
                {listing.description}
              </p>
              {/* Services Section */}
<div className="mt-8">
  <h2 className="text-xl font-bold text-black mb-4">Services</h2>
  <div className="grid grid-cols-3 gap-4">
    {/* Each service card */}
    <div className="bg-slate-100 p-4 rounded-sm">
      <h3 className="font-medium mb-2">Haircut</h3>
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-500">45 min</span>
        <span className="font-medium">$30</span>
      </div>
    </div>

    <div className="bg-slate-100 p-4 rounded-sm">
      <h3 className="font-medium mb-2">Beard Trim</h3>
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-500">30 min</span>
        <span className="font-medium">$20</span>
      </div>
    </div>

    <div className="bg-slate-100 p-4 rounded-sm">
      <h3 className="font-medium mb-2">Full Service</h3>
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-500">1 hour</span>
        <span className="font-medium">$45</span>
      </div>
    </div>
  </div>
</div>
            </div>
            
            {/* Booking section */}
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
    </div>
  </Container>
);
}
 
export default ListingClient;