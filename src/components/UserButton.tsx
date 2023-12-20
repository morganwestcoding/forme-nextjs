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
import { signIn } from "next-auth/react";

function UserButton({ session }: { session: Session | null}) {
    if (!session)
    
    return (
    <Button variant={"outline"} onClick={() => signIn()}>
        Sign In
    </Button>
        );

    return session && (
    <DropdownMenu>
  <DropdownMenuTrigger>
    <UserAvatar name={session.user?.name} image={session.user?.image}/>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Add Service</DropdownMenuItem>
    <DropdownMenuItem>Manage Services</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Sign Out</DropdownMenuLabel>
  </DropdownMenuContent>
    
</DropdownMenu>
  )
}

export default UserButton