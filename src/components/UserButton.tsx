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
  data?: SafePost;
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

  const formatTier = (tier: string | null | undefined) => {
    if (!tier) return 'Free';
    const baseTier = tier.split(' ')[0];
    return baseTier.charAt(0).toUpperCase() + baseTier.slice(1).toLowerCase();
  };

  return (      
    <DropdownMenu>   
      <DropdownMenuTrigger className="w-44 flex items-center justify-center p-2 bg-slate-50 shadow-sm shadow-gray-300 mb-2 cursor-pointer rounded-md hover:bg-[#DFE2E2] transition-colors duration-250 outline-none">
        <Avatar src={currentUser?.image ?? undefined} />
        <div className="ml-3 flex flex-col items-start">
          {currentUser ? (
            <>
              <span className="text-black text-xs font-medium -ml-[0.5px]">
                {currentUser.name?.split(' ')[0]}
              </span>
              <span className="text-[#71717A] text-xs">
                {formatTier(currentUser.subscriptionTier)}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-start">
            <span className="text-black text-xs font-medium -ml-[0.5px]">
              Login
            </span>
            <span className="text-[#71717A] text-xs">
              Free Version
            </span>
          </div>
          )}
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
            className="text-[#71717A]"
          >
            <path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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