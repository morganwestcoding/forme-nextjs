// AddListing.tsx
'use client'
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/app/types";

interface AddListingProps {
  currentUser?: SafeUser | null
}

export const dynamic = 'force-dynamic';

const AddListing: React.FC<AddListingProps> = ({}) => {
  const router = useRouter();

  const onRent = useCallback(() => {
    router.push('/listing/new');
  }, [router]);

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
              border
      border-[#5E6365]
        cursor-pointer 
        shadow-sm
        overflow-hidden
        group
      " 
      onClick={onRent}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="18" 
        height="18" 
        className="
          relative
          z-10
          text-white 
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