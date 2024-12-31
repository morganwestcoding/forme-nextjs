'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../Categories';
import { useCategory } from "@/CategoryContext";
import useDemoModal from "@/app/hooks/useDemoModal";
import UserButton from "../UserButton";
import AddListing from "../header/AddListing";
import Notification from "../header/Notification";
import Inbox from "../header/Inbox";
import { SafePost, SafeUser } from "@/app/types";
import MobileUserButton from './MobileUserButton';
import Sidebar from '../sidebar/Sidebar';

interface MobileNavBarProps {
  currentUser?: SafeUser | null;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentUser }) => {
    const router = useRouter();
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
      <>
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
  
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-black rounded-t-sm bg-opacity-80 w-full py-4">
              <div className="flex items-center justify-between px-4">
                  <button onClick={handleOpenSidebar} className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="#a2a2a2">
                    <path d="M4 5L20 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M4 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M4 19L20 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>

  
                  <button onClick={() => router.push('/market')} className="text-white relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" color="#ffffff" fill="#a2a2a2" fillOpacity={0.15}>
    <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" stroke-width="1" />
    <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 16H12.009" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
                  </button>
                  <button onClick={() => router.push('/')} className="text-white relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#ffffff" fill="#a2a2a2" fillOpacity={0.15}>
    <path d="M9.06165 4.82633L3.23911 9.92134C2.7398 10.3583 3.07458 11.1343 3.76238 11.1343C4.18259 11.1343 4.52324 11.4489 4.52324 11.8371V15.0806C4.52324 17.871 4.52324 19.2662 5.46176 20.1331C6.40029 21 7.91082 21 10.9319 21H13.0681C16.0892 21 17.5997 21 18.5382 20.1331C19.4768 19.2662 19.4768 17.871 19.4768 15.0806V11.8371C19.4768 11.4489 19.8174 11.1343 20.2376 11.1343C20.9254 11.1343 21.2602 10.3583 20.7609 9.92134L14.9383 4.82633C13.5469 3.60878 12.8512 3 12 3C11.1488 3 10.4531 3.60878 9.06165 4.82633Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 16H12.009" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
                  </button>
                           <button onClick={() => router.push('/market')} className="text-white relative">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#ffffff" fill="#a2a2a2" fillOpacity={0.15}>
    <path d="M14.236 5.29178C14.236 4.77191 14.236 4.51198 14.1789 4.29871C14.0238 3.71997 13.5717 3.26793 12.9931 3.11285C12.4315 2.96238 11.5684 2.96238 11.0068 3.11285C10.4281 3.26793 9.97609 3.71997 9.82101 4.29871C9.76387 4.51198 9.76387 4.77191 9.76387 5.29178C9.76387 6.34588 9.76387 9.109 9.43641 9.43647C9.10894 9.76393 6.34582 9.76393 5.29172 9.76393C4.77185 9.76393 4.51192 9.76393 4.29865 9.82107C3.71991 9.97615 3.26787 10.4282 3.11279 11.0069C2.96232 11.5685 2.96232 12.4315 3.11279 12.9931C3.26787 13.5718 3.71991 14.0239 4.29865 14.1789C4.51192 14.2361 4.77185 14.2361 5.29172 14.2361C6.34582 14.2361 9.10894 14.2361 9.43641 14.5635C9.76387 14.891 9.76387 15.418 9.76387 16.4721C9.76387 16.992 9.76387 19.4881 9.82101 19.7013C9.97609 20.28 10.4281 20.7321 11.0068 20.8871C11.5684 21.0376 12.4315 21.0376 12.9931 20.8871C13.5717 20.7321 14.0238 20.28 14.1789 19.7013C14.236 19.4881 14.236 16.992 14.236 16.4721C14.236 15.418 14.236 14.891 14.5635 14.5635C14.8909 14.2361 17.654 14.2361 18.7082 14.2361C19.228 14.2361 19.488 14.2361 19.7013 14.1789C20.28 14.0239 20.732 13.5718 20.8871 12.9931C21.0376 12.4315 21.0376 11.5685 20.8871 11.0069C20.732 10.4282 20.28 9.97615 19.7013 9.82107C19.488 9.76393 19.228 9.76393 18.7082 9.76393C17.654 9.76393 14.8909 9.76393 14.5635 9.43647C14.236 9.109 14.236 6.34588 14.236 5.29178Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
</svg>
                  </button>
                  <MobileUserButton currentUser={currentUser} />
     
              </div>

          </div>
        </div>
      </>
    );
  };

export default MobileNavBar;