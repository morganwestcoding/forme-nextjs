"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Avatar from "./ui/avatar";;
import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafePost, SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";

interface UserButtonProps {
currentUser?: SafeUser | null 
data: SafePost;
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  data,
}) => {
  const router = useRouter();

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);
    
    return (  
      <div 
      
      className="inline-flex items-center border-[#ffffff] border justify-center whitespace-nowrap rounded-full drop-shadow-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md bg-[#ffffff] bg-opacity-75 hover:bg-accent hover:text-accent-foreground">
        
    <DropdownMenu>   
  <DropdownMenuTrigger>
    
    <Avatar src={currentUser?.image}
     />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
  {currentUser ? (
    <>
    
    <DropdownMenuItem
    onClick={() => router.push(`/profile`)}>Profile</DropdownMenuItem>
    <DropdownMenuItem
    onClick={() => router.push('/properties')}>Manage Listings</DropdownMenuItem>
    <DropdownMenuItem
    onClick={() => router.push('/trips')}
    >My Appointments</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
    <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
    </>
    ) : (
      <>
    <DropdownMenuItem onClick={loginModal.onOpen}>Login</DropdownMenuItem>
    <DropdownMenuItem onClick={registerModal.onOpen}>Signup</DropdownMenuItem>
    </>
    )}
  </DropdownMenuContent>
</DropdownMenu>
</div> 
    );
  }
  


export default UserButton