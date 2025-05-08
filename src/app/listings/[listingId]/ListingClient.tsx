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
import AboutUsSection from "@/components/listings/AboutUsSection";

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

  // New handler for service selection from AboutUsSection
  const handleServiceSelect = useCallback((serviceId: string, serviceName: string, price: number) => {
    const service: SelectedService = {
      value: serviceId,
      label: `${serviceName} - $${price}`,
      price: price
    };
    
    handleServiceChange(service);
    
    // Scroll to booking section
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handleServiceChange]);

  return ( 
    <Container>
      <div className="max-w-full">
        <div className="flex flex-col gap-6">
          <div className="flex gap-6">
            {/* Left column - ListingHead and About Us stacked */}
            <div className="w-full flex bg-white flex-col gap-4 p-6 mx-12">
              {/* ListingHead at original width */}
              <ListingHead 
                listing={listing}
                currentUser={currentUser}
              />
              
              {/* About Us section directly beneath ListingHead */}
              <AboutUsSection
                description={listing.description}
                listing={listing}
                currentUser={currentUser}
                isOwner={isOwner}
                onEditListing={() => rentModal.onOpen(listing)}
                services={listing.services}
                onServiceSelect={handleServiceSelect}
              />
            </div>
            
            {/* Right column - Booking section */}

          </div>
        </div>
      </div>
    </Container>
  );
}
 
export default ListingClient;