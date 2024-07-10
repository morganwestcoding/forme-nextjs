'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';
import Image from "next/image";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { categories } from "@/components/Categories";
import ListingHead from "@/components/listings/ListingHead";
import ListingInfo from "@/components/listings/ListingInfo";
import ListingReservation from "@/components/listings/ListingReservation";
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection'
};

interface ListingRightBarProps {
    listing: SafeListing & { user: SafeUser };
    reservations?: SafeReservation[];
    currentUser?: SafeUser | null;
    selectedServices: Set<string>;
    toggleServiceSelection: (serviceId: string) => void;
    totalPrice: number;
 
    onCreateReservation: () => void;
    isLoading: boolean;
    disabledDates: Date[];
    description: string
  }

const ListingRightBar: React.FC<ListingRightBarProps> = ({
  listing,
  description,
  reservations = [],
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  // New state for tracking selected services
  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [totalPrice, setTotalPrice] = useState(0);
  const placeholderImages = [
    "/assets/business-2.jpg",
    "/assets/business-1.jpg",
    "/assets/business-4.jpg",
    "/assets/business-3.jpg",
    "/assets/skyline.jpg",
    "/assets/scenic view.jpeg",
    "/assets/water-sample.jpg",
    "/assets/coral-sample.jpg",
    "/assets/swimmer-sample.jpg",
  ];

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
    <div className="flex flex-col justify-end bg-transparent  gap-6 pr-16 h-auto mt-8">
      <div className="flex flex-col justify-between w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 md:py-6 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]">
      <div className="text-xl font-bold mb-2">About Us
            <div className="text-sm font-normal flex-grow">
              <p className="py-2">
              {description}
              </p>
              <ul>
              <li className="flex items-center justify-center mb-5 p-2 rounded-lg shadow-sm bg-white border px-2 w-full h-28 mb-2 relative">
  <Image
    src="/assets/8KmHl.png"
    alt="Map Placeholder"
    layout="fill" // This will cover the <li> element area
    objectFit="cover" // Ensures the image covers the area nicely
  />
 
</li>
                {/* Adjusted list items to include flex layout for icon and text alignment */}
                <li className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 w-full mb-2"> 
                 <div className="flex items-center justify-center p-1  cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
    <path d="M5 9C5 5.70017 5 4.05025 6.02513 3.02513C7.05025 2 8.70017 2 12 2C15.2998 2 16.9497 2 17.9749 3.02513C19 4.05025 19 5.70017 19 9V15C19 18.2998 19 19.9497 17.9749 20.9749C16.9497 22 15.2998 22 12 22C8.70017 22 7.05025 22 6.02513 20.9749C5 19.9497 5 18.2998 5 15V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M11 19H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 2L9.089 2.53402C9.28188 3.69129 9.37832 4.26993 9.77519 4.62204C10.1892 4.98934 10.7761 5 12 5C13.2239 5 13.8108 4.98934 14.2248 4.62204C14.6217 4.26993 14.7181 3.69129 14.911 2.53402L15 2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
</svg>
                 </div>
                   <span className="ml-4 text-xs font-light text-[#a2a2a2]">(310) 372-1171</span>
                 </li>
           
                 <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2 mb-2">
                 <div className="flex items-center justify-center  p-1  cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
    <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M16.8463 14.6095L19.4558 12C21.5147 9.94113 21.5147 6.60303 19.4558 4.54416C17.397 2.48528 14.0589 2.48528 12 4.54416L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.397 2.48528 14.0589 4.54416 12L7.1537 9.39045" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
                 </div>
                   <span className="ml-4 text-xs font-light text-[#a2a2a2]">https://www.redondo.org/</span> {/* Display the formatted creation date here */}
                 </li>
                 <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2">
                 <div className="flex items-center justify-center  p-1  cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
    <path d="M11.922 4.79004C16.6963 3.16245 19.0834 2.34866 20.3674 3.63261C21.6513 4.91656 20.8375 7.30371 19.21 12.078L18.1016 15.3292C16.8517 18.9958 16.2267 20.8291 15.1964 20.9808C14.9195 21.0216 14.6328 20.9971 14.3587 20.9091C13.3395 20.5819 12.8007 18.6489 11.7231 14.783C11.4841 13.9255 11.3646 13.4967 11.0924 13.1692C11.0134 13.0742 10.9258 12.9866 10.8308 12.9076C10.5033 12.6354 10.0745 12.5159 9.21705 12.2769C5.35111 11.1993 3.41814 10.6605 3.0909 9.64127C3.00292 9.36724 2.97837 9.08053 3.01916 8.80355C3.17088 7.77332 5.00419 7.14834 8.6708 5.89838L11.922 4.79004Z" stroke="currentColor" stroke-width="1.5" />
</svg>
                 </div>
                   <span className="ml-4 text-xs font-light text-[#a2a2a2]">415 Diamond Street, Redondo Beach, CA 90277</span> {/* Display the formatted creation date here */}
                 </li>
                 </ul>
              </div>
              </div>
              </div>
       
      <div className="w-full md:w-11/12 grid grid-cols-3 gap-0 mx-4 md:mr-20 md:ml-2 bg-transparent bg-opacity-80 rounded-2xl shadow-sm">
  {Array.from({ length: 9 }).map((_, index) => {
    // Determine the class for rounding specific corners based on the square's position
    let cornerClass = "";
    if (index === 0) cornerClass = "rounded-tl-2xl"; // Top-left corner of the grid
    if (index === 2) cornerClass = "rounded-tr-2xl"; // Top-right corner of the grid
    if (index === 6) cornerClass = "rounded-bl-2xl"; // Bottom-left corner of the grid
    if (index === 8) cornerClass = "rounded-br-2xl"; // Bottom-right corner of the grid

    const squareClasses = `w-full h-24 bg-white bg-opacity-80 ${cornerClass}`;
    return (
      <div key={index} className={squareClasses} style={{ position: 'relative' }}>
      <Image
      src={placeholderImages[index]}
      className={squareClasses}
      layout="fill"
      objectFit="cover"
      alt={`Placeholder ${index + 1}`}/>
      
      </div>
    );
  })}
</div>
         

            


              
            
         
        </div>

   );
}
 
export default ListingRightBar;