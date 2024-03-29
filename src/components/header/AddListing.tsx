'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import { SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import { useCallback, useState } from "react";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";

interface AddListingProps {
  currentUser?: SafeUser | null 
}

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
    <div className="flex items-center justify-center bg-[#e2e8f0]  rounded-full p-3 cursor-pointer shadow-sm border border-white ">
    
          <AddRoundedIcon className="w-5 h-5 text-[#ffffff]"/>

      </div>
  )
}

export default AddListing