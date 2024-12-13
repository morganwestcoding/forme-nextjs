'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Container from "../Container";
import UserButton from "../UserButton";
import { SafePost, SafeUser } from "@/app/types";
import Logo from "./Logo";

interface MobileHeaderProps {
  currentUser?: SafeUser | null;
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  currentUser, 
  onMenuClick 
}) => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-50">
      <Container>
        <div className="flex items-center justify-between py-4">
          <button 
            onClick={onMenuClick}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Logo />

          <div className="flex items-center space-x-4">
            <button 
              className="p-2"
              onClick={() => router.push('/search')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <UserButton currentUser={currentUser} data={{} as SafePost} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MobileHeader;