"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Avatar from "./ui/avatar";
import Logo from "./header/Logo";
import { signOut } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafePost, SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import useProfileModal from "@/app/hooks/useProfileModal";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import Image from "next/image";

interface UserButtonProps {
  currentUser?: SafeUser | null;
  data?: SafePost;
  onMobileClose?: () => void;
}

const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  data,
  onMobileClose
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

  // Handle analytics navigation
  const handleAnalyticsClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
    router.push('/analytics');
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

  return (      
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>   
      <DropdownMenuTrigger 
        className="w-full px-4 py-3 flex items-center justify-between bg-white shadow-sm mb-6 cursor-pointer rounded-md hover:bg-gray-50 transition-colors duration-200 outline-none touch-manipulation border border-gray-100" 
        onClick={handleButtonClick}
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center">
          <div className="mr-3">
            <Image
              alt="ForMe Logo"
              className="h-7 w-5"
              height={32}
              width={32}
              src="/logos/black.png"
            />
          </div>
          
          <div className="flex flex-col items-start justify-center">
            {currentUser ? (
              <>
                <span className="text-gray-900 text-sm font-medium">
                  {currentUser.name?.split(' ')[0]}
                </span>
                <span className=" text-xs font-light">
                  {formatTier(currentUser.subscriptionTier)}
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-900 text-sm font-medium">
                  Guest
                </span>
                <span className=" text-xs font-light">
                  Free Version
                </span>
              </>
            )}
          </div>
        </div>
        
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
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="
          w-56
          bg-white
          rounded-lg 
          py-1 
          shadow-lg 
          border border-gray-100
          z-[100]
        "
        sideOffset={5}
        align="center"
        onEscapeKeyDown={() => setIsOpen(false)}
        onPointerDownOutside={() => setIsOpen(false)}
      >
        {currentUser ? (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
            
            <DropdownMenuSeparator className="my-1 border-t border-gray-100"/>
            
            <DropdownMenuItem
              onClick={handleProfileClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleListingsClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              My Listings
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleAddListingClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Add Listing
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleAnalyticsClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Analytics
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleSubscriptionClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Subscription
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1 border-t border-gray-100"/>
            
            <DropdownMenuItem
              onClick={handleSignOutClick}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={handleLoginClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Login
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleRegisterClick}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Sign Up
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;