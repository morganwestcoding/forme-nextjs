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


  const getCategoryStyle = (categoryName) => {
    const category = categories.find(cat => cat.label === categoryName);
    if (!category) return { textColor: 'text-gray-200', borderColor: 'border-gray-200' };

    const colorPart = category.color.split('-').slice(1).join('-'); // Extract color part from bg- class
    return { textColor: `text-${colorPart}`, borderColor: `border-${colorPart}` };
  };

  const categoryStyle = getCategoryStyle(data.category);

  return (
    <div 
      onClick={() => router.push(`/listings/${data.id}`)} 
      className="col-span-1 cursor-pointer group"
    >
      <div className="bg-[#ffffff] bg-opacity-90 rounded-xl flex flex-col gap-2 w-52 shadow-md">
        <div 
          className="
            w-full
            h-36
            relative 
            overflow-hidden 
            rounded-t-lg
          "
        >
          <Image
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
        <div className={`inline-block ${categoryStyle.borderColor} rounded-lg px-2 py-0.5 mx-auto my-1 ml-3 text-xs font-light border-2`}>
          <div className={categoryStyle.textColor}>
        {data.category}
        
        </div>
        </div>
        
        {/* Title */}
        <div className="font-semibold text-sm capitalize px-4">
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
      <div className="flex justify-between text-xs text-[#7d8085] font-medium capitalize items-center pb-3.5 pt-1 px-4">
        <button onClick={handlePreviousService}><ChevronLeft size={26} strokeWidth={1.25}/></button>
        <div className="flex items-center">
          {/* Colored Circle */}
          
         
           <span className="ml"> {/* Margin left for spacing */}
          {data.services[currentServiceIndex].serviceName} ${data.services[currentServiceIndex].price}
        </span>
        </div>
        <button onClick={handleNextService}>
            <ChevronRight size={26} strokeWidth={1.25}/></button>
            
        
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