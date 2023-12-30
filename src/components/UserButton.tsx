"use client";
import { Session } from "next-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Avatar from "./ui/avatar";;
import { signIn, signOut } from "next-auth/react";
import { useCallback, useState } from "react";

import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeUser } from "@/app/types";

interface UserButtonProps {
  currentUser?: SafeUser | null 
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser
}) => {

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);
    
    return (   
    <DropdownMenu>
        
  <DropdownMenuTrigger>
    <Avatar src={currentUser?.image} />

  </DropdownMenuTrigger>
  <DropdownMenuContent>
  {currentUser ? (
    <>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Add Service</DropdownMenuItem>
    <DropdownMenuItem>Manage Services</DropdownMenuItem>
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
    );
  }


export default UserButton