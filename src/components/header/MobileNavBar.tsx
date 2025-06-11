'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { categories } from '../Categories';
import { useCategory } from "@/CategoryContext";
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
    const pathnameValue = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
  
    // Set active tab based on current path
    useEffect(() => {
      // Handle potential null pathname
      if (!pathnameValue) return;
      
      const pathname = pathnameValue;
      
      if (pathname === '/') {
        setActiveTab('home');
      } else if (pathname === '/market') {
        setActiveTab('market');
      } else if (pathname === '/explore') {
        setActiveTab('explore');
      } else if (pathname.startsWith('/profile')) {
        setActiveTab('profile');
      }
    }, [pathnameValue]);

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

    const navigateTo = (route: string, tab: string) => {
      setActiveTab(tab);
      router.push(route);
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
          {/* Navbar Background with Blur Effect */}
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg w-full pt-4 pb-6 border-t border-gray-800">
            <div className="grid grid-cols-5 items-center justify-items-center mx-2 relative">
              {/* Menu Button */}
              <button 
                onClick={handleOpenSidebar} 
                className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'menu' ? 'text-[#60A5FA]' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Menu</span>
              </button>

              {/* Market Button */}
              <button 
                onClick={() => navigateTo('/market', 'market')} 
                className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'market' ? 'text-[#60A5FA]' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10.9871V15.4925C3 18.3243 3 19.7403 3.87868 20.62C4.75736 21.4998 6.17157 21.4998 9 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" />
                    <path d="M17.7957 2.50294L6.14983 2.53202C4.41166 2.44248 3.966 3.78259 3.966 4.43768C3.966 5.02359 3.89055 5.87774 2.82524 7.4831C1.75993 9.08846 1.83998 9.56536 2.44071 10.6767C2.93928 11.5991 4.20741 11.9594 4.86862 12.02C6.96883 12.0678 7.99065 10.2517 7.99065 8.97523C9.03251 12.1825 11.9955 12.1825 13.3158 11.8157C14.6385 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0096 10.3439 22.4107 9.04401 21.2967 7.6153C20.5285 6.63001 20.2084 5.7018 20.1032 4.73977C20.0423 4.18234 19.9888 3.58336 19.5971 3.20219C19.0247 2.64515 18.2035 2.47613 17.7957 2.50294Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Market</span>
              </button>

              {/* Center Home Button with Animation - In its own grid cell for proper alignment */}
              <div className="flex justify-center -mt-10 relative">
                <button 
                  onClick={() => navigateTo('/', 'home')} 
                  className="relative flex items-center justify-center"
                >
                  {/* Outer Glow Animation */}
                  <div className={`absolute inset-0 rounded-full ${activeTab === 'home' ? 'animate-pulse-slow opacity-100' : 'opacity-0'} transition-opacity duration-300 bg-[#60A5FA] blur-md`}></div>
                  
                  {/* Pulse Rings - Only visible when active */}
                  {activeTab === 'home' && (
                    <>
                      <div className="absolute w-full h-full rounded-full bg-[#60A5FA] opacity-20 animate-ping-slow"></div>
                      <div className="absolute w-full h-full rounded-full bg-[#60A5FA] opacity-30 animate-ping-slower"></div>
                    </>
                  )}
                  
                  {/* Main Button Background */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-full ${activeTab === 'home' ? 'bg-[#60A5FA]' : 'bg-gray-800'} shadow-lg transition-all duration-300 z-10`}>
                    {/* Icon */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="28" 
                      height="28" 
                      fill="none" 
                      stroke={activeTab === 'home' ? 'white' : '#60A5FA'} 
                      strokeWidth="2" 
                      className="transition-all duration-300"
                    >
                      <path d="M9.06165 4.82633L3.23911 9.92134C2.7398 10.3583 3.07458 11.1343 3.76238 11.1343C4.18259 11.1343 4.52324 11.4489 4.52324 11.8371V15.0806C4.52324 17.871 4.52324 19.2662 5.46176 20.1331C6.40029 21 7.91082 21 10.9319 21H13.0681C16.0892 21 17.5997 21 18.5382 20.1331C19.4768 19.2662 19.4768 17.871 19.4768 15.0806V11.8371C19.4768 11.4489 19.8174 11.1343 20.2376 11.1343C20.9254 11.1343 21.2602 10.3583 20.7609 9.92134L14.9383 4.82633C13.5469 3.60878 12.8512 3 12 3C11.1488 3 10.4531 3.60878 9.06165 4.82633Z" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Explore Button */}
              <button 
                onClick={() => navigateTo('/explore', 'explore')} 
                className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'explore' ? 'text-[#60A5FA]' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.236 5.292C14.236 4.772 14.236 4.512 14.179 4.299C14.024 3.72 13.572 3.268 12.993 3.113C12.432 2.962 11.569 2.962 11.007 3.113C10.428 3.268 9.976 3.72 9.821 4.299C9.764 4.512 9.764 4.772 9.764 5.292C9.764 6.346 9.764 9.109 9.436 9.436C9.109 9.764 6.346 9.764 5.292 9.764C4.772 9.764 4.512 9.764 4.299 9.821C3.72 9.976 3.268 10.428 3.113 11.007C2.962 11.568 2.962 12.432 3.113 12.993C3.268 13.572 3.72 14.024 4.299 14.179C4.512 14.236 4.772 14.236 5.292 14.236C6.346 14.236 9.109 14.236 9.436 14.564C9.764 14.891 9.764 15.418 9.764 16.472C9.764 16.992 9.764 19.488 9.821 19.701C9.976 20.28 10.428 20.732 11.007 20.887C11.568 21.038 12.432 21.038 12.993 20.887C13.572 20.732 14.024 20.28 14.179 19.701C14.236 19.488 14.236 16.992 14.236 16.472C14.236 15.418 14.236 14.891 14.564 14.564C14.891 14.236 17.654 14.236 18.708 14.236C19.228 14.236 19.488 14.236 19.701 14.179C20.28 14.024 20.732 13.572 20.887 12.993C21.038 12.432 21.038 11.568 20.887 11.007C20.732 10.428 20.28 9.976 19.701 9.821C19.488 9.764 19.228 9.764 18.708 9.764C17.654 9.764 14.891 9.764 14.564 9.436C14.236 9.109 14.236 6.346 14.236 5.292Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Explore</span>
              </button>

              {/* Profile Button */}
              <button 
                onClick={() => navigateTo(`/profile/${currentUser?.id || ''}`, 'profile')} 
                className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'profile' ? 'text-[#60A5FA]' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Profile</span>
              </button>
            </div>
          </div>
          
          {/* Add bottom padding for home indicator on newer iOS devices */}
          <div className="h-5 bg-gray-900"></div>
        </div>

        {/* Define animations in global styles */}
        <style jsx global>{`
          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              opacity: 0;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          
          @keyframes ping-slower {
            0% {
              transform: scale(1);
              opacity: 0.2;
            }
            50% {
              opacity: 0;
            }
            100% {
              transform: scale(1.8);
              opacity: 0;
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.5;
            }
            50% {
              opacity: 0.8;
            }
          }
          
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .animate-ping-slower {
            animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </>
    );
  };

export default MobileNavBar;