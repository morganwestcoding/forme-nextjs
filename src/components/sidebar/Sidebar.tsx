"use client"

import Carousel from "./Carousel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CottageRoundedIcon from '@mui/icons-material/CottageRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import CloseFriends from "./Carousel";
import Logo from "../header/Logo";
import Categories from "../Categories";
import { useState } from "react";
import Image from "next/image";

export default function Sidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true); // State to manage collapse
  


  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  return (
    
    <div className="fixed top-0 flex h-screen z-50">
      <div className="flex flex-col items-center w-52 h-full p-10 bg-white  backdrop-blur-lg bg drop-shadow-sm rounded-tr-2xl" >
        <Logo/>

        <ul className="list-none m-0 p-0 flex flex-col items-center ">
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  bg-[#b1dafe]  w-36" onClick={() => router.push('/')}>
          <div className="flex flex-col  hover:bg-white rounded-full p-1 cursor-pointer" >
            
          <CottageRoundedIcon className="w-4 h-4 hover:text-[#48DBFB] text-[#ffffff]"/>
          </div>
                  <span className="ml-6 text-white text-xs font-normal hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  w-36 bg-transparent">
          <div className="flex flex-col  rounded-2xl p-1 cursor-pointer" onClick={() => router.push('/market')}>
            <StorefrontRoundedIcon className="w-4 h-4 text-[#8d8d8d]" />
            </div>
            <span className="ml-6 text-[#8d8d8d] text-xs font-normal ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  w-36">
          <div className="flex flex-col rounded-2xl p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
          <BookmarkRoundedIcon className="w-4 h-4 text-[#8d8d8d] "/>
          </div>     

           
          <span className="ml-6 text-[#8d8d8d] text-xs font-normal ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  w-36">
          <div className="flex flex-col rounded-2xl p-1 cursor-pointer">
          <WorkRoundedIcon className="w-4 h-4 text-[#8d8d8d]" />
          </div>
          <span className="ml-6 text-[#8d8d8d] text-xs font-normal ">Jobs</span>
            
       
          </li>
        

          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  w-36">
          <div className="flex flex-col  rounded-2xl p-1 cursor-pointer" onClick={() => router.push('/reservations')}>
          <EventNoteRoundedIcon className="w-4 h-4 text-[#8d8d8d]" />
          </div>
          <span className="ml-6 text-[#8d8d8d] text-xs font-normal ">Bookings</span>
            
          </li>
          
       </ul>
          
        </div>
       
        
      </div>

  )
}
