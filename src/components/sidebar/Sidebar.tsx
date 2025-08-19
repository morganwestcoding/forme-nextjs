"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { categories } from '../Categories';
import { useState, useEffect } from "react";
import { useCategory } from "@/CategoryContext";
import { SafeUser } from "@/app/types";
import { SafePost } from "@/app/types";

import axios from 'axios';
import useInboxModal from '@/app/hooks/useInboxModal';
import { useColorContext } from "@/app/context/ColorContext";
import Logo from "../header/Logo";
import UserButton from "../UserButton";
import { IoStorefrontOutline } from "react-icons/io5"; // ← added

interface SidebarProps {
  currentUser?: SafeUser | null;
  onMobileClose?: () => void;  
  isMobile?: boolean;          
}

interface Category {
  label: string;
  color: string;
  description: string;
  gradient: string;
}
export const dynamic = 'force-dynamic';

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onMobileClose,
  isMobile = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedButton, setSelectedButton] = useState('');
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [filterActive, setFilterActive] = useState(false);
  const [reservationCount, setReservationCount] = useState(0);
  const inboxModal = useInboxModal();
  const { accentColor, hexColor } = useColorContext();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevHexColor, setPrevHexColor] = useState(hexColor);

  // Set the selected button based on the current path
  useEffect(() => {
    if (pathname === '/') {
      setSelectedButton('home');
    } else if (pathname === '/explore') {
      setSelectedButton('explore');
    } else if (pathname === '/market') {
      setSelectedButton('market');
    } else if (pathname === '/favorites') {
      setSelectedButton('favorites');
    } else if (pathname === '/jobs') {
      setSelectedButton('jobs');
    } else if (pathname === '/analytics') {
      setSelectedButton('analytics');
    } else if (pathname === '/bookings/reservations') {
      setSelectedButton('Appointments');
    } else if (pathname === '/vendors') {
      setSelectedButton('vendors');
    } else if (pathname === '/notifications') {
      setSelectedButton('notifications');
    }
  }, [pathname]);

  // Fetch reservation count
  useEffect(() => {
    const fetchReservationCount = async () => {
      if (currentUser) {
        try {
          const response = await axios.get('/api/reservations/count');
          setReservationCount(response.data);
        } catch (error) {
          console.error('Error fetching reservation count:', error);
        }
      }
    };

    fetchReservationCount();
  }, [currentUser]);

  // Navigation helpers
  const handleNavigate = (route: string, buttonId: string) => {
    setSelectedButton(buttonId);
    if (isMobile && onMobileClose) onMobileClose();
    router.push(route);
  };

  const handleModalOpen = (modalFunction: () => void, buttonId: string) => {
    setSelectedButton(buttonId);
    if (isMobile && onMobileClose) onMobileClose();
    setTimeout(() => {
      modalFunction();
    }, 10);
  };

  const getTextColorStyle = (isSelected: boolean) => {
    if (isSelected) {
      return {
        color: isTransitioning ? prevHexColor : hexColor,
        transition: 'color 0.8s ease-in-out'
      } as React.CSSProperties;
    }
    return {};
  };
  
  return (
    <div className="h-screen overflow-y-auto shadow-sm bg-white">
      <div className="flex flex-col items-center w-56 h-full pb-10 pt-12 z-50">
        {/* Top Bar Layout with Logo and UserButton */}
        <Logo variant="vertical" />
        <UserButton currentUser={currentUser} />

        {/* Mobile Close Button */}
        {isMobile && (
          <div 
            className="absolute top-4 right-6 cursor-pointer md:hidden"
            onClick={onMobileClose}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="20" 
              height="20" 
              color="currentColor" 
              fill="none"
            >
              <path 
                d="M3.99982 11.9998L19.9998 11.9998" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M8.99963 17C8.99963 17 3.99968 13.3176 3.99966 12C3.99965 10.6824 8.99966 7 8.99966 7" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        )}

        <div className="flex flex-col w-full px-6 pt-4">
          {/* Explore & Discover */}
          <div className="mb-6">
            <div className="text-xs text-neutral-400 uppercase mb-2 text-center font-medium">Explore & Discover</div>
            <ul className="list-none m-0 p-0 flex flex-col items-center space-y-1">
              
              {/* Discover */}
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'home' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/', 'home')}
                  style={selectedButton === 'home' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'home' ? getTextColorStyle(true) : {}}
                    >

    <path d="M5.63604 18.3638C4.00736 16.7351 3 14.4851 3 11.9999C3 7.02929 7.02944 2.99986 12 2.99986C14.4853 2.99986 16.7353 4.00721 18.364 5.63589M20.2941 8.49986C20.7487 9.57574 21 10.7584 21 11.9999C21 16.9704 16.9706 20.9999 12 20.9999C10.7586 20.9999 9.57589 20.7485 8.5 20.2939" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15.8292 3.82152C18.5323 2.13939 20.7205 1.51937 21.6005 2.39789C23.1408 3.93544 20.0911 9.48081 14.7889 14.7838C9.48663 20.0868 3.93971 23.1394 2.39946 21.6018C1.52414 20.728 2.13121 18.5599 3.79165 15.8774" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </div>



                  <span className={`ml-3 text-sm ${selectedButton === 'home' ? 'font-medium' : ''}`}>
                   Discover
                  </span>
                </div>
              </li>

              {/* Market – replaced icon with IoStorefrontOutline */}
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'market' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleNavigate('/market', 'market')}
                  style={selectedButton === 'market' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'market' ? getTextColorStyle(true) : {}}
                    >

    <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
    <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>

                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'market' ? 'font-medium' : ''}`}>
                    Market
                  </span>
                </div>
              </li>

              {/* Vendors (shops) */}
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'shops' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleNavigate('/shops', 'shops')}
                  style={selectedButton === 'shops' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'shops' ? getTextColorStyle(true) : {}}
                    >


    <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12 7.5V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M10 10.5H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>


                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'shops' ? 'font-medium' : ''}`}>
                    Vendors
                  </span>
                </div>
              </li>

            </ul>
          </div>
          
          {/* My Content */}
          <div className="mb-6">
            <div className="text-xs text-neutral-400 uppercase mb-2 text-center font-medium">My Content</div>
            <ul className="list-none m-0 p-0 flex flex-col items-center space-y-1">
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'favorites' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleNavigate('/favorites', 'favorites')}
                  style={selectedButton === 'favorites' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'favorites' ? getTextColorStyle(true) : {}}
                    >
                      <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'favorites' ? 'font-medium' : ''}`}>
                    Favorites
                  </span>
                </div>
              </li>

              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'Appointments' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleNavigate('/bookings/reservations', 'Appointments')}
                  style={selectedButton === 'Appointments' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'Appointments' ? getTextColorStyle(true) : {}}
                    >
                      <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'Appointments' ? 'font-medium' : ''}`}>
                    Appointments
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Connections */}
          <div className="mb-6">
            <div className="text-xs text-neutral-400 uppercase mb-2 text-center font-medium">Connections</div>
            <ul className="list-none m-0 p-0 flex flex-col items-center space-y-1">
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'inbox' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleModalOpen(() => inboxModal.onOpen(currentUser), 'inbox')}
                  style={selectedButton === 'inbox' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'inbox' ? getTextColorStyle(true) : {}}
                    >
                      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'inbox' ? 'font-medium' : ''}`}>
                    Inbox
                  </span>
                </div>
              </li>
              
              <li className="relative w-full">
                <div 
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'notifications' ? '' : 'text-gray-500 hover:text-neutral-700 hover:bg-gray-50'}
                  `} 
                  onClick={() => handleNavigate('/notifications', 'notifications')}
                  style={selectedButton === 'notifications' ? getTextColorStyle(true) : {}}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                      style={selectedButton === 'notifications' ? getTextColorStyle(true) : {}}
                    >
                      <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm ${selectedButton === 'notifications' ? 'font-medium' : ''}`}>
                    Notifications
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
