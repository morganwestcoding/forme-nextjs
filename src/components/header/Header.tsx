'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from "../Container";
import AddListing from "./AddListing";
import UserButton from "../UserButton";
import { SafePost, SafeUser, SafeListing } from "@/app/types";
import Notification from "./Notification";
import Inbox from "./Inbox";
import Search from "./Search";
import Filter from "./Filter";
import MobileHeader from "./MobileHeader";
import Sidebar from "../sidebar/Sidebar";

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchResult = (result: SafeUser | SafeListing) => {
    if ('email' in result) {
      router.push(`/profile/${result.id}`);
    } else {
      router.push(`/listings/${result.id}`);
    }
  };

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          currentUser={currentUser} 
          onMenuClick={handleMobileMenuClick}
        />
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Sidebar />
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block mt-5 -mb-3">
        <Container>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Search onResultClick={handleSearchResult} />
            </div>
            <div className="flex items-center space-x-2.5">
              <AddListing />
              <Inbox currentUser={currentUser || null} />
              <Notification />
              <UserButton currentUser={currentUser} data={{} as SafePost} />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;