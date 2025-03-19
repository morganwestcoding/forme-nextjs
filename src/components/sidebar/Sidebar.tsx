"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Logo from "../header/Logo";
import { categories } from '../Categories';
import { useState, useEffect } from "react";
import { useCategory } from "@/CategoryContext";
import useDemoModal from "@/app/hooks/useDemoModal";
import Avatar from "../ui/avatar";
import { SafeUser } from "@/app/types";
import UserButton from "../UserButton";
import { SafePost } from "@/app/types";
import Search from "../header/Search";
import FilterTab from "../FilterTab";
import axios from 'axios';
import useInboxModal from '@/app/hooks/useInboxModal';

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
  const demoModal = useDemoModal();
  const [selectedButton, setSelectedButton] = useState('');
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [filterActive, setFilterActive] = useState(false);
  const [reservationCount, setReservationCount] = useState(0);
  const inboxModal = useInboxModal();

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
    } else if (pathname === '/reservations') {
      setSelectedButton('Appointments');
    } else if (pathname === '/vendors') {
      setSelectedButton('vendors');
    } else if (pathname === '/notifications') {
      setSelectedButton('notifications');
    }
  }, [pathname]);

  // Add this useEffect hook
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

  const handleCategorySelect = (category: Category) => {
    if (selectedCategory === category.label) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category.label);
    }
  };

  const [isDemoHidden, setIsDemoHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideDemoButton') === 'true';
    }
    return false;
  });

  // Handler for navigation and modals with explicit sidebar closing
  const handleNavigate = (route: string, buttonId: string) => {
    // Update selected button state
    setSelectedButton(buttonId);
    
    // Close sidebar if on mobile - do this BEFORE navigation
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
    
    // Navigate to the route
    router.push(route);
  };

  // Handler for modal opening with explicit sidebar closing
  const handleModalOpen = (modalFunction: () => void, buttonId: string) => {
    // Update selected button state
    setSelectedButton(buttonId);
    
    // Close sidebar if on mobile - do this BEFORE opening modal
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
    
    // Open the modal with a slight delay to ensure sidebar closes first
    setTimeout(() => {
      modalFunction();
    }, 10);
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="flex flex-col items-center w-56 h-full px-6 pb-10 pt-10 bg-white z-50">
        {isMobile && (
          <>
            <div 
              className="absolute top-4 right-6 cursor-pointer md:hidden mb-8"
              onClick={onMobileClose}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                color="#000000" 
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
            <div className="h-6" /> {/* Add a spacer */}
          </>
        )}

        <Logo variant="vertical" />
        <UserButton currentUser={currentUser} data={{} as SafePost} onMobileClose={onMobileClose} />

        <div className="flex flex-col w-full">
          <ul className="list-none m-0 p-0 flex flex-col items-center hover:text-white ">
            <li className={` group flex items-center justify-start mb-2.5 mt-2 p-2 rounded-md transition-colors duration-250 ${
              selectedButton === 'explore' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
            } w-44`} 
              onClick={() => handleNavigate('/explore', 'explore')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="22" 
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color={selectedButton === 'explore' ? "#ffffff" : "#71717A"} 
                  className="group-hover:text-white"
                >
                  <path d="M9.49811 15L16.9981 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.00634 7.67888L15.327 4.21881C18.3688 2.78111 19.8897 2.06226 20.8598 2.78341C21.8299 3.50455 21.5527 5.14799 20.9984 8.43486L20.0435 14.0968C19.6811 16.246 19.4998 17.3205 18.6989 17.7891C17.8979 18.2577 16.8574 17.8978 14.7765 17.178L8.41077 14.9762C4.51917 13.6301 2.57337 12.9571 2.50019 11.6365C2.427 10.3159 4.28678 9.43692 8.00634 7.67888Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.49811 15.5V17.7274C9.49811 20.101 9.49811 21.2878 10.2083 21.4771C10.9185 21.6663 11.6664 20.6789 13.1622 18.7039L13.9981 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'explore' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
              }`}>Discover</span>
            </li>

            <li className={` group flex items-center justify-start mb-2.5 p-2  rounded-md  transition-colors duration-250   ${
              selectedButton === 'home' ? 'bg-[#4A5568]' : ' hover:bg-gray-200'
              } w-44`}
              onClick={() => handleNavigate('/', 'home')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors" >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={21.5} height={21.5} color={selectedButton === 'home' ? "#ffffff" : "#71717A"} fill={selectedButton === 'home' ? "#ffffff" : "none"} className="group-hover:text-white">
                <path d="M15.0002 17C14.2007 17.6224 13.1504 18 12.0002 18C10.8499 18 9.79971 17.6224 9.00018 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M2.35157 13.2135C1.99855 10.9162 1.82204 9.76763 2.25635 8.74938C2.69065 7.73112 3.65421 7.03443 5.58132 5.64106L7.02117 4.6C9.41847 2.86667 10.6171 2 12.0002 2C13.3832 2 14.5819 2.86667 16.9792 4.6L18.419 5.64106C20.3462 7.03443 21.3097 7.73112 21.744 8.74938C22.1783 9.76763 22.0018 10.9162 21.6488 13.2135L21.3478 15.1724C20.8473 18.4289 20.5971 20.0572 19.4292 21.0286C18.2613 22 16.5538 22 13.139 22H10.8614C7.44652 22 5.73909 22 4.57118 21.0286C3.40327 20.0572 3.15305 18.4289 2.65261 15.1724L2.35157 13.2135Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'home' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
              }`}>Home</span>
            </li>

            <li className={` group flex items-center justify-start mb-2.5 p-2 rounded-md  transition-colors duration-250   ${
              selectedButton === 'market' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/market', 'market')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors" >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'market' ? "#ffffff" : "#71717A"}  fill={selectedButton === 'market' ? "#4A5568" : "none"}  className=" group-hover:text-white">
                  <path d="M3 10.9871V15.4925C3 18.3243 3 19.7403 3.87868 20.62C4.75736 21.4998 6.17157 21.4998 9 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5" fill={selectedButton === 'market' ? "#ffffff" : "none"}  />
                  <path className={`${selectedButton !== 'market' ? 'group-hover:stroke-white' : 'none'}`} d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68409 17.584 9 16.9768" stroke={selectedButton === 'market' ? "#71717A" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M17.7957 2.50294L6.14983 2.53202C4.41166 2.44248 3.966 3.78259 3.966 4.43768C3.966 5.02359 3.89055 5.87774 2.82524 7.4831C1.75993 9.08846 1.83998 9.56536 2.44071 10.6767C2.93928 11.5991 4.20741 11.9594 4.86862 12.02C6.96883 12.0678 7.99065 10.2517 7.99065 8.97523C9.03251 12.1825 11.9955 12.1825 13.3158 11.8157C14.6385 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0096 10.3439 22.4107 9.04401 21.2967 7.6153C20.5285 6.63001 20.2084 5.7018 20.1032 4.73977C20.0423 4.18234 19.9888 3.58336 19.5971 3.20219C19.0247 2.64515 18.2035 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'market' ? 'text-white' : 'text-[#71717A] group-hover:text-white hover:-gray-200'
              }`}>Market</span>
            </li>
            
            <li className={` group flex items-center justify-start mb-2.5 p-2 rounded-md  transition-colors duration-250   ${
              selectedButton === 'favorites' ? 'bg-[#4A5568]': ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/favorites', 'favorites')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'favorites' ? "#ffffff" : "#71717A"} fill={selectedButton === 'favorites' ? "#ffffff" : "none"} className=" group-hover:text-white">
                  <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>     
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'favorites' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
              }`}>Favorites</span>
            </li>
            
            <li className={` group flex items-center justify-start mb-2.5 p-2 rounded-md   transition-colors duration-250 ${
              selectedButton === 'jobs' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/jobs', 'jobs')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'jobs' ? "#ffffff" : "#71717A"}  fill={"none"} className="group-hover:text-white">
                  <path d="M10 12.3333C10 12.0233 10 11.8683 10.0341 11.7412C10.1265 11.3961 10.3961 11.1265 10.7412 11.0341C10.8683 11 11.0233 11 11.3333 11H12.6667C12.9767 11 13.1317 11 13.2588 11.0341C13.6039 11.1265 13.8735 11.3961 13.9659 11.7412C14 11.8683 14 12.0233 1412.3333V13C14 14.1046 13.1046 15 12 15C10.8954 15 10 14.1046 10 13V12.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.8016 13C14.1132 12.9095 14.4666 12.8005 14.88 12.673L19.0512 11.3866C20.5358 10.9288 21.2624 10.131 21.4204 8.74977C21.4911 8.13198 21.5265 7.82308 21.4768 7.57022C21.3349 6.84864 20.7289 6.26354 19.9213 6.06839C19.6383 6 19.283 6 18.5724 6H5.42757C4.717 6 4.36172 6 4.07871 6.06839C3.27111 6.26354 2.6651 6.84864 2.52323 7.57022C2.47351 7.82308 2.50886 8.13198 2.57956 8.74977C2.73764 10.131 3.46424 10.9288 4.94882 11.3866L9.11996 12.673C9.53336 12.8005 9.88684 12.9095 10.1984 13" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3.46283 11L3.26658 13.1723C2.91481 17.0662 2.73892 19.0131 3.86734 20.2566C4.99576 21.5 6.93851 21.5 10.824 21.5H13.176C17.0615 21.5 19.0042 21.5 20.1327 20.2566C21.2611 19.0131 21.0852 17.0662 20.7334 13.1723L20.5372 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.5 5.5L15.4227 5.23509C15.0377 3.91505 14.8452 3.25503 14.3869 2.87752C13.9286 2.5 13.3199 2.5 12.1023 2.5H11.8977C10.6801 2.5 10.0714 2.5 9.61309 2.87752C9.15478 3.25503 8.96228 3.91505 8.57727 5.23509L8.5 5.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'jobs' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
              }`}>Jobs</span>
            </li>

            <li className={` group flex items-center justify-start mb-2.5 p-2 rounded-md  transition-colors duration-250 ${
              selectedButton === 'Appointments' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/bookings/reservations', 'Appointments')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width={20} 
                      height={20} 
                      color={selectedButton === 'Appointments' ? "#ffffff" : "#71717A"}
                      fill="none"
                      className="group-hover:text-white"
                    >
                      <path 
                        d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        className="group-hover:stroke-white"
                      />
                      <path 
                        d="M18 2V4M6 2V4M3 8H21" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        className="group-hover:stroke-white"
                      />
                      <path 
                        d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        className="group-hover:stroke-white"
                      />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm font-light ${
                    selectedButton === 'Appointments' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
                  }`}>Appointments</span>
                </div>
                {reservationCount > 0 && (
                  <div className="bg-[#78C3FB] px-2 py-1 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs">{reservationCount}</span>
                  </div>
                )}
              </div>
            </li>

            <li className={` group flex items-center justify-start mb-2.5 p-2 rounded-md transition-colors duration-250 ${
              selectedButton === 'vendors' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/vendors', 'vendors')}
            >
              <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width={20} 
                  height={20} 
                  color={selectedButton === 'vendors' ? "#ffffff" : "#71717A"}
                  fill="none"
                  className="group-hover:text-white"
                >
                  <path 
                    d="M8 16L16.7201 15.2733C19.4486 15.046 20.0611 14.45 20.3635 11.7289L21 6" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M6 6H22" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  <circle 
                    cx="6" 
                    cy="20" 
                    r="2" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                  />
                  <circle 
                    cx="17" 
                    cy="20" 
                    r="2" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                  />
                  <path 
                    d="M8 20L15 20" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M2 2H2.966C3.91068 2 4.73414 2.62459 4.96326 3.51493L7.93852 15.0765C8.08887 15.6608 7.9602 16.2797 7.58824 16.7616L6.63213 18" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-light ${
                selectedButton === 'vendors' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
              }`}>Vendors</span>
            </li>
            
            <li 
              className={` group flex items-center justify-start mb-2.5 p-2 rounded-md transition-colors duration-250 ${
                selectedButton === 'inbox' ? 'bg-[#4A5568]' : ' hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleModalOpen(() => inboxModal.onOpen(currentUser), 'inbox')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="group flex items-center justify-center w-8 py-1 rounded-full p-1 cursor-pointer transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'inbox' ? "#ffffff" : "#71717A"} fill="none" className="group-hover:text-white">
                      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm font-light ${
                    selectedButton === 'inbox' ? 'text-white' : 'text-[#71717A]  group-hover:text-white'
                  }`}>Inbox</span>
                </div>
              </div>
            </li>
            
            <li className={` group flex items-center justify-start  p-2 rounded-md transition-colors duration-250 ${
              selectedButton === 'notifications' ? 'bg-[#4A5568]' : 'hover:bg-gray-200 hover:text-white transition-all'
              } w-44`} 
              onClick={() => handleNavigate('/notifications', 'notifications')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="group flex flex-col rounded-full p-1 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'notifications' ? "#ffffff" : "#71717A"} fill="none" className="group-hover:text-white">
                      <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`ml-3 text-sm font-light ${
                    selectedButton === 'notifications' ? 'text-white' : 'text-[#71717A] group-hover:text-white'
                  }`}>Notifications</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;