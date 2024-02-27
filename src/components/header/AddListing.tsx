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
    <Button className="bg-[#ffffff] bg-opacity-25 " onClick={onRent} variant={'outline'} size="icon">
    
          <AddRoundedIcon className="w-6 h-6 text-[#ffffff]"/>

      </Button>
  )
}

export default AddListing