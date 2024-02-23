"use client"

import { useRouter } from "next/navigation";
import Link from "next/link";
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CottageRoundedIcon from '@mui/icons-material/CottageRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BookmarksRoundedIcon from '@mui/icons-material/BookmarksRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
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
      <div className="flex flex-col items-center w-52 h-full backdrop-blur-sm  bg-[#ffffff97] bg-opacity-80 drop-shadow dark:shadow-lg dark:border dark:border-gray-6.500 p-10" >
        <Logo/>
        <div className="flex flex-col item-center pt-9 text-xs font-bold text-[#4d4d4d] opacity-75">
          MENU
        </div>
        
        <ul className="list-none m-0 p-0 ">
        
        {/* Home Icon with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <li className="flex items-center mb-5 pt-5">
            <Tooltip >
                <TooltipTrigger>
          <CottageRoundedIcon className="w-6.5 h-6.5 opacity-75 text-[#7d8085]  cursor-pointer" onClick={() => router.push('/')}/>
                </TooltipTrigger>
                
                <TooltipContent side="right">
                  <p>Home</p>
                </TooltipContent>
            </Tooltip>
          </li>
        </TooltipProvider>

          {/* Market Icon with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <li className="flex items-center mb-5">
            <Tooltip >
              
                <TooltipTrigger>
            <StorefrontOutlinedIcon className="w-6.5 h-6.5 opacity-75 text-[#7d8085] font-light cursor-pointer" onClick={() => router.push('/market')}/>
                </TooltipTrigger>

                <TooltipContent side="right" >
                  <p>Market</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </TooltipProvider>

           {/* Favorites Icon with Tooltip */}
          <TooltipProvider delayDuration={100}>
            <li className="flex items-center mb-5">
             <Tooltip >
                <TooltipTrigger>
          <BookmarksRoundedIcon className="w-6.5 h-6.5 opacity-75 text-[#7d8085] " onClick={() => router.push('/favorites')}/>
                </TooltipTrigger>

                <TooltipContent side="right" >
                  <p>Favorites</p>
                </TooltipContent>
            </Tooltip>
            </li>
         </TooltipProvider>

         {/* Job Icon with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <li className="flex items-center mb-5">
            <Tooltip >
                <TooltipTrigger>
          <BusinessCenterRoundedIcon className="w-6.5 h-6.5 opacity-75 text-[#7d8085] " />
                </TooltipTrigger>
                <TooltipContent side="right" >
                <p>Jobs</p>
                </TooltipContent>
            </Tooltip>
          </li>
        </TooltipProvider>  

        <TooltipProvider delayDuration={100}>
          <li className="flex items-center mb-5">
          <Tooltip >
                <TooltipTrigger>
          <CalendarMonthOutlinedIcon className="w-6.5 h-6.5 opacity-75 text-[#7d8085] " onClick={() => router.push('/reservations')}/>
                </TooltipTrigger>
                <TooltipContent side="right" >
                <p>Bookings</p>
                </TooltipContent>
          </Tooltip>
          </li>
        </TooltipProvider>  
  
        </ul>
        
      
        </div>
        
      </div>

  )
}
