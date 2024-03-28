'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { format } from 'date-fns';

import useStates from "@/app/hooks/useStates";
import { 
  SafeListing, 
  SafeReservation, 
  SafeUser 
} from "@/app/types";

import HeartButton from "../HeartButton";
import ModalButton from "../modals/ModalButton";
import { categories } from "../Categories";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

interface ListingCardProps {
  data: SafeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null
  categories: typeof categories;
  
};

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  categories,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = '',
  currentUser,
}) => {
    console.log(data.services);
  const router = useRouter();
  const { getByValue } = useStates();

  const location = getByValue(data.locationValue);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const handleNextService = () => {
    setCurrentServiceIndex((prevIndex) => 
      (prevIndex + 1) % data.services.length // Loop through services
    );
  };

  const handlePreviousService = () => {
    setCurrentServiceIndex((prevIndex) => 
      prevIndex === 0 ? data.services.length - 1 : prevIndex - 1
    );
  };

  const currentService = data.services[currentServiceIndex];

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (disabled) {
      return;
    }

    onAction?.(actionId)
  }, [disabled, onAction, actionId]);

  

  const reservationDate = useMemo(() => {
    if (!reservation) {
      return null;
    }
  
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    return `${format(start, 'PP')} - ${format(end, 'PP')}`;
  }, [reservation]);

  const getColorByCategory = (categoryName: string) => {
    const category = categories.find(cat => cat.label === categoryName);
    if (!category) return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };

    switch (category.color) {
        case 'bg-yellow-200':
            return { bgColorClass: 'bg-yellow-200', textColorClass: 'text-yellow-200', borderColorClass: 'border-yellow-200' };
        case 'bg-rose-200':
            return { bgColorClass: 'bg-rose-200', textColorClass: 'text-rose-200', borderColorClass: 'border-rose-200' };
        case 'bg-orange-300':
            return { bgColorClass: 'bg-orange-300', textColorClass: 'text-orange-300', borderColorClass: 'border-orange-300' };
        case 'bg-teal-500':
            return { bgColorClass: 'bg-teal-500', textColorClass: 'text-teal-500', borderColorClass: 'border-teal-500' };
        case 'bg-emerald-600':
            return { bgColorClass: 'bg-emerald-600', textColorClass: 'text-emerald-600', borderColorClass: 'border-emerald-600' };
        case 'bg-cyan-600':
            return { bgColorClass: 'bg-cyan-600', textColorClass: 'text-cyan-600', borderColorClass: 'border-cyan-600' };
        case 'bg-blue-800':
            return { bgColorClass: 'bg-blue-800', textColorClass: 'text-blue-800', borderColorClass: 'border-blue-800' };
        case 'bg-indigo-800':
            return { bgColorClass: 'bg-indigo-800', textColorClass: 'text-indigo-800', borderColorClass: 'border-indigo-800' };
        default:
            return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };
    }
  };




const categoryColors = getColorByCategory(data.category);

  return (
    <div 
      
      className="col-span-1 "
    >
      <div className="bg-[#ffffff] rounded-2xl flex flex-col gap-2 w-48 shadow-sm">
        <div 
          className="
            w-full
            h-32
            relative 
            overflow-hidden 
            rounded-t-2xl
            cursor-pointer group
          "
        >
          <Image
            onClick={() => router.push(`/listings/${data.id}`)} 
            fill
            className="
            
              object-cover 
                w-full
                h-full
              group-hover:scale-110 
              transition
            "
            src={data.imageSrc}
            alt="Listing"
          />
          <div className="
            absolute
            top-3
            right-3
          ">
            <HeartButton 
              listingId={data.id} 
              currentUser={currentUser}
            />
          </div>
        </div>
        <div className={`inline-block ${categoryColors.bgColorClass} drop-shadow-sm rounded px-2 py-1 mx-auto my-1 ml-3 text-xs font-light`}>
            <div className="text-white">
        {data.category}
        
        </div>
        </div>
        
        {/* Title */}
        <div className="font-medium text-sm capitalize px-4">
          {data.title}
        </div>
{/* Location */}
        <div className="font-light text-xs px-4 text-neutral-500 pb-2">
          Los Angeles, {location?.label}
        </div>
         {/* Category */}
        
        <hr/>
          {/* Service Navigation */}
          {data.services && data.services.length > 0 && (
      <div className="flex justify-between text-xs capitalize items-center pb-3.5 pt-1 px-4 text-[#7d8085]">
        <button onClick={handlePreviousService}><NavigateBeforeRoundedIcon/></button>
        <div className="flex items-center text-[#7d8085] font-normal">
          
           <span className="ml"> {/* Margin left for spacing */}
          {data.services[currentServiceIndex].serviceName} ${data.services[currentServiceIndex].price}
        </span>
        </div>
        <button onClick={handleNextService}>
            <NavigateNextRoundedIcon /></button>
            
        
      </div>
      
    )}
        {onAction && actionLabel && (
          <ModalButton
            disabled={disabled}
            small
            label={actionLabel} 
            onClick={handleCancel}
          />
        )}
      </div>
    </div>
   );
}
 
export default ListingCard;