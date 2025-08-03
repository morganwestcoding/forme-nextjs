"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Avatar from "./ui/avatar";
import { signOut } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import useProfileModal from "@/app/hooks/useProfileModal";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import { SafePost, SafeUser } from "@/app/types";

interface UserButtonProps {
  currentUser?: SafeUser | null;
  data?: SafePost;
  onMobileClose?: () => void;
  noBg?: boolean;
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  data,
  onMobileClose,
  noBg = false,
}) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const profileModal = useProfileModal();
  const subscribeModal = useSubscribeModal();
  const [isOpen, setIsOpen] = useState(false);

  const formatTier = (tier: string | null | undefined) => {
    if (!tier) return "Free";
    const baseTier = tier.split(" ")[0];
    return baseTier.charAt(0).toUpperCase() + baseTier.slice(1).toLowerCase();
  };

  const handleClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    callback();
  };

  const handleSignOut = handleClick(() => signOut());
  const handleLogin = handleClick(() => loginModal.onOpen());
  const handleRegister = handleClick(() => registerModal.onOpen());
  const handleRent = handleClick(() => rentModal.onOpen());
  const handleSubscribe = handleClick(() => subscribeModal.onOpen());
  const handleProfile = handleClick(() =>
    router.push(`/profile/${currentUser?.id}`)
  );
  const handleListings = handleClick(() => router.push("/properties"));

  const buttonClass = noBg
    ? "flex items-center justify-start cursor-pointer outline-none touch-manipulation"
    : "w-44 py-2.5 mt-1 px-4 bg-blue-50 flex items-center justify-start mb-6 cursor-pointer rounded-xl border border-[#60A5FA] hover:bg-[#DFE2E2] transition-all outline-none";

  // Determine dropdown width based on noBg prop
  const dropdownWidthClass = noBg ? "min-w-44" : "w-44";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={buttonClass}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        data-state={isOpen ? "open" : "closed"}
      >
        <Avatar src={currentUser?.image ?? undefined} />
        <div className="ml-3 flex flex-col items-start text-left">
          {currentUser ? (
            <>
              <span className="text-black text-sm font-medium leading-none">
                {currentUser.name?.split(" ")[0]}
              </span>
              <div className="h-1" /> {/* vertical space */}
              <span className="text-[#60A5FA] text-xs leading-none">
                Free Version
              </span>
            </>
          ) : (
            <>
              <span className="text-black text-sm font-medium leading-none">
                Login
              </span>
              <div className="h-1" /> {/* vertical space */}
              <span className="text-[#60A5FA] text-xs leading-none">
                Free Version
              </span>
            </>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`bg-white bg-opacity-90 backdrop-blur-lg rounded-lg p-2 shadow-lg border-none z-[100] ${dropdownWidthClass}`}
        side="bottom"
        align="center"
        sideOffset={8}
      >
        {currentUser ? (
          <>
            <DropdownMenuItem onClick={handleProfile}>My Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleListings}>
              My Listings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRent}>My Analytics</DropdownMenuItem>
            <DropdownMenuItem onClick={handleRent}>Add Listing</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscribe}>Subscription</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleLogin}>Login</DropdownMenuItem>
            <DropdownMenuItem onClick={handleRegister}>Signup</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;