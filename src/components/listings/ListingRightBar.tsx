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
    dateRange: Range;
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
                 <LocalPhoneOutlinedIcon className="w-4 h-4  text-[#a2a2a2]" />
                 </div>
                   <span className="ml-1 text-xs font-light text-[#717171]">(310) 372-1171</span>
                 </li>
           
                 <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2 mb-2">
                 <div className="flex items-center justify-center  p-1  cursor-pointer">
                 <LanguageOutlinedIcon className="w-4 h-4  text-[#a2a2a2]" />
                 </div>
                   <span className="ml-1 text-xs font-light text-[#717171]">https://www.redondo.org/</span> {/* Display the formatted creation date here */}
                 </li>
                 <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2">
                 <div className="flex items-center justify-center  p-1  cursor-pointer">
                 <PlaceOutlinedIcon className="w-4 h-4  text-[#a2a2a2]" />
                 </div>
                   <span className="ml-1 text-xs font-light text-[#717171]">415 Diamond Street, Redondo Beach, CA 90277</span> {/* Display the formatted creation date here */}
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