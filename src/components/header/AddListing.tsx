// AddListing.tsx
'use client'
import { useCallback, useState } from "react";
import { SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";

interface AddListingProps {
  currentUser?: SafeUser | null 
}

export const dynamic = 'force-dynamic';

const AddListing: React.FC<AddListingProps> = ({}) => {
  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);

  const onRent = useCallback(() => {
    rentModal.onOpen();
  }, [rentModal]);

  return (
    <div 
    id="add-listing-button" 
      className="
        relative
        flex 
        items-center 
        justify-center 
        bg-[#5E6365]
        rounded-full 
        p-3 
        cursor-pointer 
        shadow
        transform
        transition-all
        duration-500
        ease-out
        hover:shadow-[#5E6365]/50
        hover:shadow-md
        overflow-hidden
        group
        before:content-['']
        before:absolute
        before:w-12
        before:h-12
        before:bg-white/10
        before:top-1/2
        before:left-1/2
        before:-translate-x-1/2
        before:-translate-y-1/2
        before:rounded-full
        before:scale-0
        before:opacity-0
        hover:before:scale-150
        hover:before:opacity-100
        before:transition-all
        before:duration-500
        before:ease-out
      " 
      onClick={onRent}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="19" 
        height="19" 
        className="
          relative
          z-10
          text-white 
          transition-transform 
          duration-500 
          group-hover:scale-110
        "
        fill="none"
      >
        <path 
          d="M12 4V20" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M4 12H20" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  )
}

export default AddListing;