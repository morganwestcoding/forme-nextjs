"use client"

import { useRouter } from "next/navigation";
import Link from "next/link";
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import CottageRoundedIcon from '@mui/icons-material/CottageRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import Avatar from "../ui/avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Newspaper } from 'lucide-react';
import { Store } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { Briefcase } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import Logo from "../header/Logo";
import Categories from "../Categories";
import { useState } from "react";
import Image from "next/image";
import UserButton from "../UserButton";

export default function Sidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true); // State to manage collapse
  


  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  return (
    
    <div className="fixed top-0 flex h-screen z-50">
      <div className="flex flex-col items-start w-56 h-full p-10 bg-[#ffffff]  bg-opacity-85 rounded-r-2xl drop-shadow-sm" >
        
        <Logo/>
       
        <ul className="list-none m-0 p-0 flex flex-col -ml-2 mt-5 items-start">

   
          <li className="flex items-start justify-start mb-5 p-2 hover:bg-[#48DBFB w-36" onClick={() => router.push('/')}>
          
            
          <Newspaper strokeWidth={1.25} className="w-5 h-5 hover:text-[#48DBFB] text-[#000000]"/>
          
                  <span className="ml-3 text-[#4d4d4d] text-xs font-normal hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-start justify-start mb-5 p-2 w-36" onClick={() => router.push('/market')}>
         
            <Store strokeWidth={1.25} className="w-5 h-5 text-[#000000]" />
        
            <span className="ml-3 text-[#4d4d4d] text-xs font-normal ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-start justify-start mb-5 p-2 w-36" onClick={() => router.push('/favorites')}>
          
          <Bookmark strokeWidth={1.25} className="w-5 h-5 text-[#000000]"/>
             

           
          <span className="ml-3 text-[#4d4d4d] text-xs font-normal ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-start justify-start mb-5 p-2 w-36">

          <Briefcase strokeWidth={1.25} className="w-5 h-5 text-[#000000]" />
          
          <span className="ml-3 text-[#4d4d4d] text-xs font-normal ">Jobs</span>
            
       
          </li>
        

          <li className="flex items-start justify-start mb-5 p-2 w-36" onClick={() => router.push('/reservations')}>
         
          <CalendarDays strokeWidth={1.25} className="w-5 h-5 text-[#000000]" />
          
          <span className="ml-3 text-[#4d4d4d] text-xs font-normal ">Bookings</span>
            
          </li>
        </ul>
        </div>
        
      </div>

  )
}
