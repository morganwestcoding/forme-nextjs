"use client"

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

import CloseFriends from "./CloseFriends";
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
      <div className="flex flex-col items-center w-56 h-full p-10 bg-[#ffffff]  bg-opacity-85 rounded-r-2xl drop-shadow-sm" >
        <Logo/>
        <div className=" pt-9 text-xs font-medium text-[#4d4d4d] mb-6 underline underline-offset-8">
          Menu
        </div>
       
        
        <ul className="list-none m-0 p-0 flex flex-col items-center">
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm hover:bg-[#48DBFB] bg-white  w-36">
          <div className="flex flex-col bg-[#48DBFB] hover:bg-white rounded-full p-1 cursor-pointer drop-shadow-sm" onClick={() => router.push('/')}>
            
          <CottageRoundedIcon className="w-4 h-4 hover:text-[#48DBFB] text-[#ffffff]"/>
          </div>
                  <span className="ml-6 text-[#4d4d4d] text-xs font-medium hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm bg-white w-36">
          <div className="flex flex-col bg-[#b7b7b7] rounded-full p-1 cursor-pointer drop-shadow-sm" onClick={() => router.push('/market')}>
            <StorefrontRoundedIcon className="w-4 h-4 text-[#ffffff]" />
            </div>
            <span className="ml-6 text-[#4d4d4d] text-xs font-medium ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm bg-white w-36">
          <div className="flex flex-col bg-[#b7b7b7] rounded-full p-1 cursor-pointer drop-shadow-sm" onClick={() => router.push('/favorites')}>
          <BookmarkRoundedIcon className="w-4 h-4 text-[#ffffff]"/>
          </div>     

           
          <span className="ml-6 text-[#4d4d4d] text-xs font-medium ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm bg-white w-36">
          <div className="flex flex-col bg-[#b7b7b7] rounded-full p-1 cursor-pointer drop-shadow-sm">
          <WorkRoundedIcon className="w-4 h-4 text-[#ffffff]" />
          </div>
          <span className="ml-6 text-[#4d4d4d] text-xs font-medium ">Jobs</span>
            
       
          </li>
        

          <li className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm bg-white w-36">
          <div className="flex flex-col bg-[#b7b7b7] rounded-full p-1 cursor-pointer drop-shadow-sm" onClick={() => router.push('/reservations')}>
          <EventNoteRoundedIcon className="w-4 h-4 text-[#ffffff]" />
          </div>
          <span className="ml-6 text-[#4d4d4d] text-xs font-medium ">Bookings</span>
            
          </li>
        </ul>
        <CloseFriends/>
      
        </div>
        
      </div>

  )
}
