"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCategory } from "@/CategoryContext";
import { SafeUser } from "@/app/types";
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import { useColorContext } from "@/app/context/ColorContext";
import Logo from "../header/Logo";
import UserButton from "../UserButton";
import axios from 'axios';

interface SidebarProps {
  currentUser?: SafeUser | null;
  onMobileClose?: () => void;  
  isMobile?: boolean;          
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onMobileClose,
  isMobile = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const notificationsModal = useNotificationsModal();
  const [selectedButton, setSelectedButton] = useState('');
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [reservationCount, setReservationCount] = useState(0);
  const inboxModal = useInboxModal();
  const { accentColor, hexColor } = useColorContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

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

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    window.dispatchEvent(new Event('sidebarToggle'));
  };
  
  return (
    <>
      {/* Expand button - shown when collapsed */}
      {!isMobile && isCollapsed && (
        <div 
          className="fixed top-0 left-0 h-screen w-8 z-[60] flex items-center"
          onMouseEnter={() => setIsHoveringEdge(true)}
          onMouseLeave={() => setIsHoveringEdge(false)}
        >
          <button
            onClick={toggleCollapse}
            className={`
              ml-0 bg-white border border-gray-200 rounded-r-lg px-1.5 py-6 shadow-sm
              hover:bg-gray-50 transition-all duration-200
              ${isHoveringEdge ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}
            `}
            style={{ transition: 'opacity 0.2s, transform 0.2s' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16" 
              fill="none"
              className="text-neutral-400"
            >
              <path d="M20.0001 11.9998L4.00012 11.9998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.0003 7C15.0003 7 20.0002 10.6824 20.0002 12C20.0002 13.3176 15.0002 17 15.0002 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Sidebar */}
      <div 
        className={`
          h-screen overflow-y-auto bg-white w-56
          fixed top-0 left-0 bottom-0 border-r border-gray-400 z-50
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Collapse button hover zone - only on right edge */}
        {!isMobile && !isCollapsed && (
          <div 
            className="absolute top-0 right-0 h-full w-8 z-10 flex items-center justify-end"
            onMouseEnter={() => setIsHoveringEdge(true)}
            onMouseLeave={() => setIsHoveringEdge(false)}
          >
            <button
              onClick={toggleCollapse}
              className={`
                mr-0 bg-white border border-gray-200 rounded-l-lg px-1.5 py-6 shadow-md
                hover:bg-gray-50 transition-all duration-200
                ${isHoveringEdge ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
              `}
              style={{ transition: 'opacity 0.2s, transform 0.2s' }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="none"
                className="text-neutral-400"
              >
                <path d="M3.99982 11.9998L19.9998 11.9998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.99963 17C8.99963 17 3.99968 13.3176 3.99966 12C3.99965 10.6824 8.99966 7 8.99966 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col items-center w-56 h-full pb-10 pt-10 z-50">
          <Logo variant="vertical" />
          <UserButton currentUser={currentUser} />

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
                <path d="M3.99982 11.9998L19.9998 11.9998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.99963 17C8.99963 17 3.99968 13.3176 3.99966 12C3.99965 10.6824 8.99966 7 8.99966 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <div className="flex flex-col w-full px-6 pt-2 flex-1">
            <ul className="list-none m-0 p-0 flex flex-col items-center space-y-4 flex-1">
              {/* Discover */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'home' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/', 'home')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M5.63604 18.3638C4.00736 16.7351 3 14.4851 3 11.9999C3 7.02929 7.02944 2.99986 12 2.99986C14.4853 2.99986 16.7353 4.00721 18.364 5.63589M20.2941 8.49986C20.7487 9.57574 21 10.7584 21 11.9999C21 16.9704 16.9706 20.9999 12 20.9999C10.7586 20.9999 9.57589 20.7485 8.5 20.2939" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M15.8292 3.82152C18.5323 2.13939 20.7205 1.51937 21.6005 2.39789C23.1408 3.93544 20.0911 9.48081 14.7889 14.7838C9.48663 20.0868 3.93971 23.1394 2.39946 21.6018C1.52414 20.728 2.13121 18.5599 3.79165 15.8774" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Discover
                  </span>
                </div>
              </li>

              {/* Market */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'market' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/market', 'market')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5"></path>
                      <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                      <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Market
                  </span>
                </div>
              </li>

              {/* Vendors */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'shops' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/shops', 'shops')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M12 7.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M10 10.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Vendors
                  </span>
                </div>
              </li>

              {/* Favorites */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'favorites' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/favorites', 'favorites')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Favorites
                  </span>
                </div>
              </li>

              {/* Appointments */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'Appointments' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleNavigate('/bookings/reservations', 'Appointments')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Appointments
                  </span>
                </div>
              </li>

              {/* Inbox */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'inbox' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleModalOpen(() => inboxModal.onOpen(currentUser), 'inbox')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Inbox
                  </span>
                </div>
              </li>
              
              {/* Notifications */}
              <li className="relative w-full">
                <div
                  className={`
                    flex items-center w-full px-5 py-2.5 rounded-md transition-all duration-200 cursor-pointer
                    ${selectedButton === 'notifications' ? 'text-[#60A5FA]' : 'text-gray-600/90 hover:text-neutral-700 hover:bg-gray-50'}
                  `}
                  onClick={() => handleModalOpen(() => notificationsModal.onOpen(), 'notifications')}
                >
                  <div className="w-8 flex justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="22" 
                      height="22" 
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="ml-3 text-sm">
                    Notifications
                  </span>
                </div>
              </li>
            </ul>

            {/* Settings Button at Bottom */}
            <div className="flex justify-center mb-5">
              <button
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-600/90 hover:text-neutral-700 transition-all duration-200"
                onClick={() => {/* Add settings functionality */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"  fill="none">
                  <path d="M8.73047 21.499C10.0226 19.276 12.9819 19.0139 14.6673 20.7126C15.0441 21.0924 15.2325 21.2824 15.3996 21.3051C15.5667 21.3278 16.6152 20.7265 16.9874 20.5131C17.3668 20.2956 18.4187 19.6922 18.4848 19.5344C18.5509 19.3765 18.4817 19.1074 18.3433 18.5692C17.8399 16.6121 19.0606 14.5524 21.011 14.0212C21.5329 13.879 21.7938 13.8079 21.8969 13.672C22 13.5361 22 12.3409 22 11.9036C22 11.4664 22 10.2711 21.8969 10.1352C21.7938 9.9993 21.5329 9.92819 21.011 9.78607C19.0603 9.25481 17.8386 7.19517 18.3418 5.23798C18.4801 4.69968 18.5493 4.43053 18.4832 4.27271C18.4171 4.1149 17.3652 3.51159 16.9859 3.29406C16.6136 3.0806 15.5651 2.47932 15.3981 2.50204C15.231 2.52478 15.0426 2.71467 14.6657 3.09447C13.2064 4.56489 10.792 4.56495 9.33276 3.09456C8.95585 2.71477 8.76739 2.52487 8.60035 2.50215C8.4333 2.47942 7.38483 3.08071 7.0126 3.29418C6.63327 3.51172 5.58126 4.11501 5.51516 4.27285C5.44907 4.43069 5.51829 4.6998 5.65672 5.23805C6.16008 7.19518 4.9394 9.25477 2.98902 9.78605C2.46711 9.92819 2.20615 9.9993 2.10308 10.1353C2 10.2711 2 11.4664 2 11.9036C2 12.3409 2 13.5361 2.10308 13.6721C2.20617 13.808 2.467 13.879 2.98866 14.0211C2.99478 14.0228 3.00089 14.0245 3.007 14.0261" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                  <path d="M2.48891 18.1828C3.56891 17.1033 7.24091 13.4688 7.60091 13.0489C7.98148 12.6051 7.67291 12.0054 7.85651 10.1461C7.94535 9.24652 8.13895 8.57254 8.69291 8.071C9.35291 7.44726 9.89291 7.44726 11.7529 7.40527C13.3729 7.44726 13.5649 7.26733 13.7329 7.68716C13.8529 7.98704 13.4929 8.16696 13.0609 8.64677C12.1009 9.60637 11.5369 10.0862 11.4829 10.3861C11.0929 11.7055 12.6289 12.4852 13.4689 11.6455C13.7866 11.328 15.2569 9.84627 15.4009 9.72632C15.5089 9.63036 15.7674 9.635 15.8929 9.78629C16.0009 9.89235 16.0129 9.90624 16.0009 10.386C15.9898 10.8302 15.9948 11.4678 15.9961 12.1253C15.9979 12.9773 15.9529 13.9246 15.5929 14.4044C14.8729 15.4839 13.6729 15.5439 12.5929 15.5919C11.5729 15.6519 10.7329 15.5439 10.4689 15.7358C10.2529 15.8438 9.11291 17.0433 7.73291 18.4227L5.27291 20.8817C3.23291 22.5011 0.988911 19.9821 2.48891 18.1828Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;