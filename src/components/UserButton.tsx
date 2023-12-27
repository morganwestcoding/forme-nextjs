"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import UserAvatar from "./UserAvatar"
import { Session } from "next-auth";
import { Button } from "./ui/button";
import { signIn, signOut } from "next-auth/react";

import useRegisterModal from "@/app/hooks/useRegisterModal";


function UserButton({ session }: { session: Session | null}) {
  const registerModal = useRegisterModal();
    // Subscription listener...
    if (!session) {
    
    return (
    <Button variant={"outline"} onClick={() => signIn()}>
        Sign In
    </Button>
        );
    }

    return session && (
    <DropdownMenu>
  <DropdownMenuTrigger>
    <UserAvatar name={session.user?.name} image={session.user?.image}/>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Add Service</DropdownMenuItem>
    <DropdownMenuItem>Manage Services</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
    <DropdownMenuItem onClick={registerModal.onOpen}>Sign Up</DropdownMenuItem>
    <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
  </DropdownMenuContent>
    
</DropdownMenu>
  )
}

export default UserButton