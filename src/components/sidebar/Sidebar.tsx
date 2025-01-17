"use client"

import { useRouter, useSearchParams } from "next/navigation";
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
isMobile }) => {
  const router = useRouter();
  const demoModal = useDemoModal();
  const [selectedButton, setSelectedButton] = useState('home');
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [filterActive, setFilterActive] = useState(false);
  const [reservationCount, setReservationCount] = useState(0);
  const inboxModal = useInboxModal(); // Add this line

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

  return (

    <div className="fixed top-0 flex h-screen z-20">
      <div className="flex flex-col items-center w-62 h-full px-6 pb-10 pt-8 bg-white backdrop-blur-full  z-50" >
  
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
              color="#ffffff" 
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
  <Logo/>
  <UserButton currentUser={currentUser} data={{} as SafePost} />

        <div className="flex flex-col w-full">
        
        <ul className="list-none m-0 p-0 flex flex-col items-center hover:text-white ">
          {/* Add this before your first menu item (Home) */}
          <div className="w-44 h-[1px] rounded-full bg-gray-200 mb-4 mt-1"></div>
<Search/>

          <li className={`border border-[#6B7280] group flex items-center justify-start mb-2 p-2  rounded-lg  transition-colors duration-250 shadow-sm ${
          selectedButton === 'home' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
          } w-44`}
          onClick={() => {
            router.push('/');
            setSelectedButton('home');
          }}
          >
            <div className="group flex flex-col   rounded-full p-1 cursor-pointer" >
            
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'home' ? "#ffffff" : "#6B7280"} fill={selectedButton === 'home' ? "#ffffff" : "none"} className="group-hover:text-white">
                <path d="M9.06165 4.82633L3.23911 9.92134C2.7398 10.3583 3.07458 11.1343 3.76238 11.1343C4.18259 11.1343 4.52324 11.4489 4.52324 11.8371V15.0806C4.52324 17.871 4.52324 19.2662 5.46176 20.1331C6.40029 21 7.91082 21 10.9319 21H13.0681C16.0892 21 17.5997 21 18.5382 20.1331C19.4768 19.2662 19.4768 17.871 19.4768 15.0806V11.8371C19.4768 11.4489 19.8174 11.1343 20.2376 11.1343C20.9254 11.1343 21.2602 10.3583 20.7609 9.92134L14.9383 4.82633C13.5469 3.60878 12.8512 3 12 3C11.1488 3 10.4531 3.60878 9.06165 4.82633Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path className={`${selectedButton !== 'home' ? 'group-hover:stroke-white' : ''}`} d="M12 16H12.009" stroke={selectedButton === 'home' ? "#6B7280" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          
          </div>
          <span className={`ml-3 text-[0.8rem] font-light ${
    selectedButton === 'home' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
  }`}>Home</span>

          </li>


          {/* Market Icon */}
   
          <li className={`border border-[#6B7280] group flex items-center justify-start mb-2 p-2 rounded-lg  transition-colors duration-250 shadow-sm ${
              selectedButton === 'market' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200 hover:-gray-200'
            } w-44`} 
            onClick={() => {
              router.push('/market');
              setSelectedButton('market');
            }}>
          <div className="group flex flex-col  rounded-full p-1 cursor-pointer" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'market' ? "#ffffff" : "#6B7280"}  fill={selectedButton === 'market' ? "#6B7280" : "none"}  className=" group-hover:text-white">
            <path d="M3 10.9871V15.4925C3 18.3243 3 19.7403 3.87868 20.62C4.75736 21.4998 6.17157 21.4998 9 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5" fill={selectedButton === 'market' ? "#ffffff" : "#none"}  />
            <path className={`${selectedButton !== 'market' ? 'group-hover:stroke-white' : 'none'}`} d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68409 17.584 9 16.9768" stroke={selectedButton === 'market' ? "#6B7280" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17.7957 2.50294L6.14983 2.53202C4.41166 2.44248 3.966 3.78259 3.966 4.43768C3.966 5.02359 3.89055 5.87774 2.82524 7.4831C1.75993 9.08846 1.83998 9.56536 2.44071 10.6767C2.93928 11.5991 4.20741 11.9594 4.86862 12.02C6.96883 12.0678 7.99065 10.2517 7.99065 8.97523C9.03251 12.1825 11.9955 12.1825 13.3158 11.8157C14.6385 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0096 10.3439 22.4107 9.04401 21.2967 7.6153C20.5285 6.63001 20.2084 5.7018 20.1032 4.73977C20.0423 4.18234 19.9888 3.58336 19.5971 3.20219C19.0247 2.64515 18.2035 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
            </div>
            <span className={`ml-3 text-[0.8rem] font-light ${
                selectedButton === 'market' ? 'text-white' : 'text-[#6B7280] group-hover:text-white hover:-gray-200'
              }`}>Market</span>
            </li>
        

           {/* Favorites Icon */}
       
           <li className={`border border-[#6B7280] group flex items-center justify-start mb-2 p-2 rounded-lg  transition-colors duration-250 shadow-sm ${
              selectedButton === 'favorites' ? 'bg-gray-500': 'bg-slate-50 hover:bg-gray-200 hover:-gray-200'
            } w-44`} 
            onClick={() => {
              router.push('/favorites');
              setSelectedButton('favorites');
            }}>
          <div className="group flex  flex-col rounded-full p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'favorites' ? "#ffffff" : "#6B7280"} fill={selectedButton === 'favorites' ? "#ffffff" : "none"} className=" group-hover:text-white">
              <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>     

           
          <span className={`ml-3 text-[0.8rem] font-light ${
                selectedButton === 'favorites' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
              }`}>Favorites</span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
         <li className={`border border-[#6B7280] group flex items-center justify-start mb-2 p-2 rounded-lg  transition-colors duration-250 ${
    selectedButton === 'jobs' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200 hover:-gray-200'
  } w-44`} 
  onClick={() => {
    router.push('/jobs');
    setSelectedButton('jobs');
  }}>
  <div className="group flex flex-col rounded-lg p-1 cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'jobs' ? "#ffffff" : "#6B7280"}  fill={"none"} className="group-hover:text-white">
      <path d="M10 12.3333C10 12.0233 10 11.8683 10.0341 11.7412C10.1265 11.3961 10.3961 11.1265 10.7412 11.0341C10.8683 11 11.0233 11 11.3333 11H12.6667C12.9767 11 13.1317 11 13.2588 11.0341C13.6039 11.1265 13.8735 11.3961 13.9659 11.7412C14 11.8683 14 12.0233 14 12.3333V13C14 14.1046 13.1046 15 12 15C10.8954 15 10 14.1046 10 13V12.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.8016 13C14.1132 12.9095 14.4666 12.8005 14.88 12.673L19.0512 11.3866C20.5358 10.9288 21.2624 10.131 21.4204 8.74977C21.4911 8.13198 21.5265 7.82308 21.4768 7.57022C21.3349 6.84864 20.7289 6.26354 19.9213 6.06839C19.6383 6 19.283 6 18.5724 6H5.42757C4.717 6 4.36172 6 4.07871 6.06839C3.27111 6.26354 2.6651 6.84864 2.52323 7.57022C2.47351 7.82308 2.50886 8.13198 2.57956 8.74977C2.73764 10.131 3.46424 10.9288 4.94882 11.3866L9.11996 12.673C9.53336 12.8005 9.88684 12.9095 10.1984 13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.46283 11L3.26658 13.1723C2.91481 17.0662 2.73892 19.0131 3.86734 20.2566C4.99576 21.5 6.93851 21.5 10.824 21.5H13.176C17.0615 21.5 19.0042 21.5 20.1327 20.2566C21.2611 19.0131 21.0852 17.0662 20.7334 13.1723L20.5372 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.5L15.4227 5.23509C15.0377 3.91505 14.8452 3.25503 14.3869 2.87752C13.9286 2.5 13.3199 2.5 12.1023 2.5H11.8977C10.6801 2.5 10.0714 2.5 9.61309 2.87752C9.15478 3.25503 8.96228 3.91505 8.57727 5.23509L8.5 5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </div>
  <span className={`ml-3 text-[0.8rem] font-light ${
    selectedButton === 'jobs' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
  }`}>Jobs</span>
</li>

<li className={`border border-[#6B7280] group flex shadow-sm items-center justify-start mb-2 p-2 rounded-lg  transition-colors duration-250 ${
    selectedButton === 'bookings' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200 hover:-gray-200'
  } w-44`} 
  onClick={() => {
    router.push('/reservations');
    setSelectedButton('bookings');
  }}>
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center">
      <div className="group flex flex-col rounded-full p-1 cursor-pointer">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={20} 
          height={20} 
          color={selectedButton === 'bookings' ? "#ffffff" : "#6B7280"}
          fill="none"
          className="group-hover:text-white"
        >
          {/* Base calendar shape */}
          <path 
            d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className="group-hover:stroke-white"
          />
          
          {/* Top bar lines */}
          <path 
            d="M18 2V4M6 2V4M3 8H21" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="group-hover:stroke-white"
          />
          
          {/* Calendar dots */}
          <path 
            d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            className="group-hover:stroke-white"
          />
        </svg>
      </div>
      <span className={`ml-3 text-[0.8rem] font-light ${
        selectedButton === 'bookings' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
      }`}>Bookings</span>
    </div>
    {reservationCount > 0 && (
            <div className="bg-[#78C3FB] px-2 py-1 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">{reservationCount}</span>
            </div>
          )}
  </div>
</li>
{/* Add this right after the Bookings button li element */}
<li className={`border border-[#6B7280] group flex items-center justify-start shadow-sm mb-4 p-2 rounded-lg transition-colors duration-250 ${
  selectedButton === 'vendors' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200 hover:-gray-200'
} w-44`} 
onClick={() => {
  router.push('/vendors');
  setSelectedButton('vendors');
}}>
  <div className="group flex flex-col rounded-full p-1 cursor-pointer">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={20} 
      height={20} 
      color={selectedButton === 'vendors' ? "#ffffff" : "#6B7280"}
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
  <span className={`ml-3 text-[0.8rem] font-light ${
    selectedButton === 'vendors' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
  }`}>Vendors</span>
</li>
      
          <div className="w-44 h-[1px] rounded-full bg-gray-200 mb-4"></div>
          <li 
  className={`border border-[#6B7280] group flex items-center bg-slate-50 justify-start mb-2 p-2 rounded-lg transition-colors duration-250 ${
    selectedButton === 'inbox' ? 'bg-gray-500' : ' hover:bg-gray-200 hover:-gray-200'
  } w-44`} 
  onClick={() => {
    setSelectedButton('inbox');
    inboxModal.onOpen();
  }}
>
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
            <div className="group flex flex-col rounded-full p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'inbox' ? "#ffffff" : "#6B7280"} fill="none" className="group-hover:text-white">
                    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            </div>
            <span className={`ml-3 text-[0.8rem] font-light ${
                selectedButton === 'inbox' ? 'text-white' : 'text-[#6B7280]  group-hover:text-white'
            }`}>Inbox</span>
        </div>
        <div className="bg-[#78C3FB] px-2 py-1 rounded-sm flex items-center justify-center">
  <span className="text-white text-xs">21</span>
</div>
    </div>
</li>
<li className={`border border-[#6B7280] group flex items-center justify-start bg-slate-50 shadow-sm mb-2 p-2 rounded-lg transition-colors duration-250 ${
  selectedButton === 'notifications' ? 'bg-gray-500' : 'hover:bg-gray-200 hover:-gray-200'
} w-44`} 
onClick={() => {
  router.push('/notifications');
  setSelectedButton('notifications');
}}>
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
            <div className="group flex flex-col rounded-full p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'notifications' ? "#ffffff" : "#6B7280"} fill="none" className="group-hover:text-white">
                    <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className={`ml-3 text-[0.8rem] font-light ${
                selectedButton === 'notifications' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
            }`}>Notifications</span>
        </div>
        <div className="bg-[#78C3FB] px-2 py-1 rounded-sm flex items-center justify-center">
  <span className="text-white text-xs">112</span>
</div>
    </div>
</li>

          </ul>

{/* Categories */}
{/*<span className="mb-5 text-[#ffffff] text-[0.8rem] font-light">Genre</span>
          <li className={`relative flex items-center justify-center mb-4 p-2 rounded-lg shadow w-44 h-20 transition-colors duration-250 ${selectedCategory ? categories.find(c => c.label === selectedCategory)?.color : 'bg-[#78C3FB]'}`}>
            <span className="text-[#ffffff] text-[0.8rem] group-hover:text-white font-light text-center h-10 rounded-lg p-3 bg-black bg-opacity-10 backdrop-blur shadow">
              {selectedCategory || 'Default'}
            </span>
          </li>
          <div className="w-44">
            <div className="grid grid-cols-4 gap-1.5 rounded-xl grid-rows-2">
        {categories.map((item: Category) => (
          <div 
            key={item.label} 
            className={`h-6 rounded-md shadow ${item.color} cursor-pointer ${selectedCategory === item.label ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            onClick={() => handleCategorySelect(item)}
          />
        ))}
            </div>
          </div>*/}
 {/*        {!isDemoHidden && (
    <li className={`group flex items-center justify-start mt-8 p-2 rounded-lg  transition-colors duration-250 ${
      selectedButton === 'demo' ? 'bg-gray-500' : 'bg-[#ffffff] hover:bg-gray-200 hover:-gray-200'
    } w-44`} 
    onClick={() => {
      setSelectedButton('demo');
      demoModal.onOpen();
    }}>
      <div className="group flex flex-col rounded-lg p-1 cursor-pointer">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={18} 
          height={18} 
          color={selectedButton === 'demo' ? "#ffffff" : "#ffffff"}  
          fill="none" 
          className="group-hover:text-white"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className={`${selectedButton !== 'demo' ? 'group-hover:stroke-white' : ''}`}
          />
          <path 
            d="M10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 9.39815 13.8837 9.76913 13.6831 10.0808C13.0854 11.0097 12 11.8954 12 13V13.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className={`${selectedButton !== 'demo' ? 'group-hover:stroke-white' : ''}`}
          />
          <path 
            d="M11.992 17H12.001" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`${selectedButton !== 'demo' ? 'group-hover:stroke-white' : ''}`}
          />
        </svg>
      </div>
      <span className={`ml-3 text-[0.8rem] font-light ${
        selectedButton === 'demo' ? 'text-white' : 'text-[#ffffff] group-hover:text-white'
      }`}>Demo</span>
    </li>
  )}*/}
        

      </div>
      </div>
    </div>
  );
}

export default Sidebar