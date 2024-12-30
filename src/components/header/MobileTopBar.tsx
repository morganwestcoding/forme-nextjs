// MobileTopBar.tsx
"use client";

import React, { useState } from 'react';
import { SafeUser } from "@/app/types";
import MobileUserButton from './MobileUserButton';
import Logo from "../header/Logo";
import Sidebar from '../sidebar/Sidebar';
import Search from './Search';

interface MobileTopBarProps {
  currentUser?: SafeUser | null;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ currentUser }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
  
    const handleOpenSidebar = () => {
        setIsAnimating(true);
        requestAnimationFrame(() => {
          setIsSidebarOpen(true);
        });
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      };
    
      const handleCloseSidebar = () => {
        setIsAnimating(true);
        setIsSidebarOpen(false);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      };
  
    return (
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-white w-full py-4 rounded-b-lg backdrop-blur-sm">
          <div className="max-w-[500px] mx-auto px-4">
            <div className="flex items-center justify-between">
              <div 
                className="w-11 h-11 flex items-center justify-center cursor-pointer"
                onClick={handleOpenSidebar}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="24" 
                  height="24" 
                  color="#000000" 
                  fill="none"
                >
                  <path d="M4 5L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 19L20 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
  
              {/* Center with search bar */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Search/>
              </div>
  
              {/* Right side with user controls */}
              <div className="flex items-center">
                <MobileUserButton currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
  
        {(isSidebarOpen || isAnimating) && (
      <div 
      className={`
        fixed inset-0 bg-black transition-all duration-300 ease-in-out z-[60]
        ${isAnimating || isSidebarOpen ? 'visible' : 'invisible'}
        ${isSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'}
      `}
      onClick={handleCloseSidebar}
    >
      <div 
        className={`
          absolute left-0 w-64 h-full transform transition-transform duration-300 ease-in-out
          ${isAnimating ? 'translate-x-[-100%]' : ''}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={e => e.stopPropagation()}
      >
              <Sidebar 
                currentUser={currentUser}
                onMobileClose={handleCloseSidebar}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

export default MobileTopBar;