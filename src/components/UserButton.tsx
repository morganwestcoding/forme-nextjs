"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Avatar from "./ui/avatar";
import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafePost, SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import useProfileModal from "@/app/hooks/useProfileModal";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";

interface UserButtonProps {
  currentUser?: SafeUser | null 
  data: SafePost;
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser
}) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const profileModal = useProfileModal();
  const SubscribeModal = useSubscribeModal();
  

  return (      
    <DropdownMenu>   
      <DropdownMenuTrigger className="w-44 bg-slate-100 flex items-center justify-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-[#DFE2E2] transition-colors duration-250 outline-none">
        <Avatar src={currentUser?.image ?? undefined} isSidebar />
        <div className="ml-3 flex flex-col justify-start">
          <span className="text-[#484848] text-xs font-medium">
            {currentUser?.name?.split(' ')[0]}
          </span>
          <span className="text-[#a2a2a2] text-xs">Premium</span>
        </div>
        <div className="ml-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-[#a2a2a2]"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="
          w-44
          bg-white
          bg-opacity-90 
          backdrop-blur-lg
          rounded-lg 
          p-2 
          shadow-lg 
          border-none
        "
      >
        {currentUser ? (
          <>
            <DropdownMenuItem
              onClick={() => router.push(`/profile/${currentUser.id}`)}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/properties')}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              My Listings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/trips')}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              My Appointments
            </DropdownMenuItem>
            <DropdownMenuItem
  onClick={() => {
    console.log('Rent modal clicked');
    rentModal.onOpen();
  }}
  className="
    p-3 
    text-black 
    hover:bg-gray-500 
    hover:bg-opacity-25 
    rounded-md 
    cursor-pointer 
    transition 
    duration-200
  "
>
  Add Listing
</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log('Subscribe clicked');
                SubscribeModal.onOpen();
              }}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-gray-500 bg-opacity-25"/>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              Sign Out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={loginModal.onOpen}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              Login
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={registerModal.onOpen}
              className="
                p-3 
                text-black 
                hover:bg-gray-500 
                hover:bg-opacity-25 
                rounded-md 
                cursor-pointer 
                transition 
                duration-200
              "
            >
              Signup
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;