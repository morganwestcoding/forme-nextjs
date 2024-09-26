'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import { SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import { useCallback, useState } from "react";


interface AddListingProps {
  currentUser?: SafeUser | null 
}

export const dynamic = 'force-dynamic';

const AddListing: React.FC<AddListingProps> = ({
  
}) => {

  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onRent = useCallback(() => {

    rentModal.onOpen();
  }, [rentModal]);

  return (
    <div className="flex items-center justify-center bg-black bg-opacity-5 rounded-full p-3 cursor-pointer shadow-sm border border-white" onClick={onRent}>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#ffffff" fill="none">
    <path d="M12 4V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M4 12H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>

      </div>
  )
}

export default AddListing