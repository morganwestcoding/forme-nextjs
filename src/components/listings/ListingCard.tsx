'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { 
  SafeListing, 
  SafeReservation, 
  SafeUser 
} from "@/app/types";

import HeartButton from "../HeartButton";
import ModalButton from "../modals/ModalButton";
import { categories } from "../Categories";


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
        <div className="px-4 pt-1 pb-1">
  <div 
    className={`w-8 h-5 ${categoryColors.bgColorClass} shadow-sm rounded-md flex items-center justify-center`} 
    title={data.category}
  >
    <span className="text-white text-xs font-extralight">
      {data.category.charAt(0).toUpperCase()}
    </span>
  </div>
</div>
        {/*<div className={`inline-block ${categoryColors.bgColorClass} drop-shadow-sm rounded px-2 py-1 mx-auto my-1 ml-3 text-xs font-light`}>
            <div className="text-white">
        {data.category}
        
        </div>
        </div>*/}
        
        {/* Title */}
        <div className="font-medium text-sm capitalize px-4">
          {data.title}
        </div>
{/* Location */}
        <div className="font-light text-xs px-4 text-neutral-500 pb-2">
        {data.location}
        </div>
         {/* Category */}
        
        <hr/>
          {/* Service Navigation */}
          {data.services && data.services.length > 0 && (
      <div className="flex justify-between text-xs capitalize items-center pb-3.5 pt-1 px-4">
        <button className="mr-2" onClick={handlePreviousService}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2" fill="none">
        <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        </button>
        <div className="text-center text-[#7d8085] font-normal">
          
           <span className="block mb-1"> {/* Margin left for spacing */}
          {data.services[currentServiceIndex].serviceName}</span>
          <span>${data.services[currentServiceIndex].price}
        </span>
        </div>
        <button className="ml-2"onClick={handleNextService}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2" fill="none">
        <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg></button>
            
        
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