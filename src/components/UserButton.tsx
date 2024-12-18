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

  return (      
    <div className="inline-flex items-center justify-center rounded-full drop-shadow text-sm font-medium">
      <DropdownMenu>   
        <DropdownMenuTrigger className="outline-none">
          <div className="relative w-11 h-11 rounded-full overflow-hidden">
            <Avatar src={currentUser?.image ?? undefined} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="
            w-58
            bg-white 
            backdrop-blur-md 
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
                Manage Listings
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
    </div> 
  );
}

export default UserButton;