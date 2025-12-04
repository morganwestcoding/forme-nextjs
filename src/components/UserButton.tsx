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
    : "w-44 py-2.5 px-3 flex items-center mt-1 gap-3 mb-5 cursor-pointer rounded-2xl relative transition-colors duration-150 outline-none bg-white/70 border border-neutral-200/50 hover:bg-white/90 active:bg-white";


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
          <div className="absolute bottom-0 right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-[1.5px] ring-white" />
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0 pl-0.5">
          {currentUser ? (
            <>
              <span className="text-neutral-900 font-medium text-xs truncate w-full text-left">
                {displayName}
              </span>
              <span className="text-neutral-500 text-xs text-left">
                {planLabel}
              </span>
            </>
          ) : (
            <>
              <span className="text-neutral-900 text-xs font-medium text-left">
                Login
              </span>
              <span className="text-neutral-500 text-[11px] text-left">
                {`${formatTier(undefined)} Tier`}
              </span>
            </>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`bg-neutral-100 rounded-2xl p-1 border border-neutral-200 z-[100] ${dropdownWidthClass}`}
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