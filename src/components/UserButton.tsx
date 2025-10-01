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
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useListingModal";
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

  const formatTier = (tier?: string | null) => {
    const cleaned = String(tier || "")
      .replace(/\s*\(.*\)\s*$/, "")
      .trim()
      .toLowerCase();

    const base = cleaned || "bronze";
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const planLabel = formatTier(currentUser?.subscriptionTier);

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
  const handleSubscribe = handleClick(() => router.push("/subscription"));
  const handleProfile = handleClick(() => {
    if (currentUser?.id) router.push(`/profile/${currentUser.id}`);
  });
  const handleListings = handleClick(() => router.push("/properties"));
  const handleAnalytics = handleClick(() => router.push("/analytics"));

  const buttonClass = noBg
    ? "flex items-center justify-start cursor-pointer outline-none touch-manipulation"
    : "w-44 py-2.5 mt-1 px-4 bg-gradient-to-br from-blue-100/90 via-blue-50 to-blue-100/90 flex items-center justify-start mb-6 cursor-pointer rounded-xl border border-[#60A5FA] hover:from-blue-100/80 hover:via-blue-50 hover:to-blue-100 hover:border-[#60A5FA] [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease] outline-none shadow-sm hover:shadow-md";

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
              <div className="h-1" />
              <span className="text-[#60A5FA] text-xs leading-none">
                {planLabel}
              </span>
            </>
          ) : (
            <>
              <span className="text-black text-sm font-medium leading-none">
                Login
              </span>
              <div className="h-1" />
              <span className="text-[#60A5FA] text-xs leading-none">
                {formatTier(undefined)}
              </span>
            </>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`bg-white bg-opacity-90 backdrop-blur-lg rounded-lg p-3 shadow-lg border-none z-[100] ${dropdownWidthClass}`}
        side="bottom"
        align="center"
        sideOffset={8}
      >
        {currentUser ? (
          <>
            <DropdownMenuItem onClick={handleProfile}>My Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleListings}>My Listings</DropdownMenuItem>
            <DropdownMenuItem onClick={handleAnalytics}>My Analytics</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscribe}>Subscription</DropdownMenuItem>
            <DropdownMenuItem >Licensing</DropdownMenuItem>
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