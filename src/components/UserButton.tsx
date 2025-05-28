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
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafePost, SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import useProfileModal from "@/app/hooks/useProfileModal";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";

interface UserButtonProps {
  currentUser?: SafeUser | null;
  data?: SafePost;
  onMobileClose?: () => void;
  compact?: boolean; 
  noBg?: boolean; // Add this prop to control background visibility
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  data,
  onMobileClose,
  compact = false,
  noBg = false
}) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const profileModal = useProfileModal();
  const SubscribeModal = useSubscribeModal();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const formatTier = (tier: string | null | undefined) => {
    if (!tier) return 'Free';
    const baseTier = tier.split(' ')[0];
    return baseTier.charAt(0).toUpperCase() + baseTier.slice(1).toLowerCase();
  };

  // Handle profile navigation
  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    router.push(`/profile/${currentUser?.id}`);
  }, [currentUser?.id, router, onMobileClose]);

  // Handle listings navigation
  const handleListingsClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    router.push('/properties');
  }, [router, onMobileClose]);

  // Handle appointments navigation
  const handleAppointmentsClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    router.push('/trips');
  }, [router, onMobileClose]);

  // Handle add listing modal
  const handleAddListingClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    rentModal.onOpen();
  }, [rentModal, onMobileClose]);

  // Handle subscription modal
  const handleSubscriptionClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    SubscribeModal.onOpen();
  }, [SubscribeModal, onMobileClose]);

  // Handle sign out
  const handleSignOutClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    signOut();
  }, [onMobileClose]);

  // Handle login modal
  const handleLoginClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    loginModal.onOpen();
  }, [loginModal, onMobileClose]);

  // Handle register modal
  const handleRegisterClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    registerModal.onOpen();
  }, [registerModal, onMobileClose]);

  // Determine button class based on compact mode and noBg prop
  const buttonClass = noBg 
    ? "flex items-center justify-center cursor-pointer outline-none touch-manipulation"
    : (compact 
        ? "flex items-center justify-center bg-gray-100 shadow-sm cursor-pointer rounded-md hover:bg-[#DFE2E2] transition-colors duration-250 outline-none touch-manipulation"
        : "w-44 py-2.5 mt-1 bg-neutral-100 flex items-center justify-center mb-6 cursor-pointer rounded-xl  border hover:bg-[#DFE2E2] transition-colors duration-250 outline-none touch-manipulation");

  return (      
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>   
      <DropdownMenuTrigger 
        className={buttonClass}
        onClick={handleButtonClick}
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
      >
        <Avatar src={currentUser?.image ?? undefined} />
        {!compact && (
          <div className="ml-3 flex flex-col items-start">
            {currentUser ? (
              <>
                <span className="text-black text-sm font-medium -ml-[0.5px]">
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
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="
        ml-6
          w-44
          bg-white
          bg-opacity-90 
          backdrop-blur-lg
          rounded-lg 
          p-2 
          shadow-lg 
          border-none
          z-[100]
        "
        sideOffset={5}
        align={compact ? "end" : "center"}
        onEscapeKeyDown={() => setIsOpen(false)}
        onPointerDownOutside={() => setIsOpen(false)}
      >
        {currentUser ? (
          <>
            <DropdownMenuItem
              onClick={handleProfileClick}
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
              onClick={handleListingsClick}
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
              onClick={handleAddListingClick}
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
              onClick={handleSubscriptionClick}
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
              Analytics
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
              Licensing
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-2 bg-gray-500 bg-opacity-25"/>
            
            <DropdownMenuItem
              onClick={handleSignOutClick}
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
              onClick={handleLoginClick}
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
              onClick={handleRegisterClick}
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