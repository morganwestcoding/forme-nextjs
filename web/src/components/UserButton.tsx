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
import { useState } from "react";
import { useRouter } from "next/navigation";
import useLoginModal from "@/app/hooks/useLoginModal";
import useSettingsModal from "@/app/hooks/useSettingsModal";
import { SafePost, SafeUser } from "@/app/types";
import { clearEarlyAccess } from "@/app/utils/earlyAccess";

interface UserButtonProps {
  currentUser?: SafeUser | null;
  data?: SafePost;
  noBg?: boolean;
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  data,
  noBg = false,
}) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const settingsModal = useSettingsModal();
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
    callback();
  };

  const handleSignOut = handleClick(() => signOut());
  const handleLogin = handleClick(() => loginModal.onOpen());
  const handleRegister = handleClick(() => router.push('/register'));
  const handleSubscribe = handleClick(() => router.push("/subscription"));
  const handleProfile = handleClick(() => {
    if (currentUser?.id) router.push(`/profile/${currentUser.id}`);
  });
  const handleListings = handleClick(() => router.push("/properties"));
  const handleLicensing = handleClick(() => router.push("/licensing"));
  const handleAnalytics = handleClick(() => router.push("/analytics"));
  const handleSettings = handleClick(() => settingsModal.onOpen());
  const handleClearEarlyAccess = handleClick(() => {
    if (window.confirm('Are you sure you want to clear early access? You will need the access code to re-enter the app.')) {
      clearEarlyAccess();
    }
  });

  // Logged out state - simple Login | Signup pill matching PageSearch style
  if (!currentUser) {
    return (
      <div className="bg-white border border-neutral-300 rounded-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={handleLogin}
            className="text-[14px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors duration-150 px-3"
          >
            Login
          </button>
          <div className="w-px h-6 bg-neutral-300" />
          <button
            onClick={handleRegister}
            className="text-[14px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors duration-150 px-3"
          >
            Signup
          </button>
        </div>
      </div>
    );
  }

  // Logged in state - dropdown with user info
  const buttonClass = noBg
    ? "flex items-center justify-start cursor-pointer outline-none touch-manipulation"
    : "bg-white border border-neutral-300 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-150 outline-none hover:bg-neutral-50";

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
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="relative">
            <Avatar src={currentUser?.image ?? undefined} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-neutral-800 font-medium text-[14px] truncate max-w-[100px] text-left leading-tight">
              {displayName}
            </span>
            <span className="text-neutral-500 text-xs text-left leading-tight">
              {planLabel}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            className={`text-neutral-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="M18 9L12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`z-[100] ${dropdownWidthClass}`}
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuItem onClick={handleProfile}>My Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={handleListings}>My Listings</DropdownMenuItem>
        <DropdownMenuItem onClick={handleAnalytics}>My Analytics</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSubscribe}>Subscription</DropdownMenuItem>
        <DropdownMenuItem onClick={handleLicensing}>Licensing</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleClearEarlyAccess}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Clean
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;