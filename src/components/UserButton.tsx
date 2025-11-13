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
import { clearEarlyAccess } from "@/app/utils/earlyAccess";

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

  const formatUserName = (name?: string | null) => {
    if (!name) return null;
    
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0];
    }
    
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[nameParts.length - 1]?.[0]?.toUpperCase();
    
    return lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName;
  };

  const planLabel = `${formatTier(currentUser?.subscriptionTier)} Tier`;
  const displayName = formatUserName(currentUser?.name);

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
  const handleLicensing = handleClick(() => router.push("/licensing"));
  const handleAnalytics = handleClick(() => router.push("/analytics"));
  const handleClearEarlyAccess = handleClick(() => {
    if (window.confirm('Are you sure you want to clear early access? You will need the access code to re-enter the app.')) {
      clearEarlyAccess();
    }
  });

  const buttonClass = noBg
    ? "flex items-center justify-start cursor-pointer outline-none touch-manipulation"
    : "w-44 py-3 px-3 bg-white flex items-center mt-1 gap-3 mb-6 cursor-pointer rounded-xl relative transition-all duration-200 outline-none group hover:bg-white/80 border border-gray-200/90 hover:border-gray-400";


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
        <div className="ml-0.5 relative">
          <Avatar src={currentUser?.image ?? undefined} />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0 pl-0.5">
          {currentUser ? (
            <>
              <span className="text-gray-700 font-medium text-xs truncate w-full text-left">
                {displayName}
              </span>
              <span className="text-gray-400 text-xs text-left">
                {planLabel}
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-700 text-xs font-medium text-left">
                Login
              </span>
              <span className="text-gray-400 text-[11px] text-left">
                {`${formatTier(undefined)} Tier`}
              </span>
            </>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`bg-white rounded-xl p-2 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] border border-gray-200/80 z-[100] ${dropdownWidthClass}`}
        side="bottom"
        align="start"
        sideOffset={8}
      >
        {currentUser ? (
          <>
            <DropdownMenuItem onClick={handleProfile}>My Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleListings}>My Listings</DropdownMenuItem>
            <DropdownMenuItem onClick={handleAnalytics}>My Analytics</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscribe}>Subscription</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLicensing}>Licensing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleClearEarlyAccess}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Early Access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleLogin}>Login</DropdownMenuItem>
            <DropdownMenuItem onClick={handleRegister}>Signup</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleClearEarlyAccess}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Early Access
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;