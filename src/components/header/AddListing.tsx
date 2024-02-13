'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import { SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import { useCallback, useState } from "react";

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
    <Button className="bg-[#ffffff] text-[#FB6848] " onClick={onRent}  variant={'outline'} size="icon"><Image src="/icons/add.svg" width={24} height={24} alt="add service" className="opacity-75 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#FFFFFF]"/></Button>
  )
}

export default AddListing