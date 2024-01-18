"use client"

import { Home, Star, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { IoStorefrontOutline } from "react-icons/io5";
import { BsBookmarks } from "react-icons/bs";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { LiaSuitcaseSolid } from "react-icons/lia";
import { HiOutlineCalendarDays } from "react-icons/hi2"
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link";
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
    
    <div className="fixed top-0 flex h-screen z-46">
      <div className="flex flex-col items-center w-48 h-full  bg-[#ffffff] bg-opacity-80 shadow-md dark:shadow-lg dark:border dark:border-gray-600 p-10" >
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
          <Image src="/icons/house.svg" alt="Home" width={24} height={24} className=" text-[#7d8085] opacity-75 cursor-pointer" onClick={() => router.push('/')}/>
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
            <Image src="/icons/shop.svg" alt="Shop" width={24} height={24} className=" text-[#7d8085] opacity-75 cursor-pointer" onClick={() => router.push('/market')}/>
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
          <Image src="/icons/save-2.svg" alt="Home" width={24} height={24} className=" text-[#7d8085] opacity-75" />
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
          <Image src="/icons/briefcase.svg" alt="Home" width={24} height={24} className="h-6 w-6 text-[#7d8085] opacity-75" />
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
          <Image src="/icons/calendar-2.svg" alt="Home" width={24} height={24} className=" text-[#7d8085] opacity-75" />
                </TooltipTrigger>
                <TooltipContent side="right" >
                <p>Bookings</p>
                </TooltipContent>
          </Tooltip>
          </li>
        </TooltipProvider>  
  
        </ul>
        <div className="list-none p-0 m-0">
        <CloseFriends/>
      
        </div>
        
      </div>
      
       
        {/* Arrow button when expanded */}
        <button onClick={toggleCollapse} className="fixed top-1/2 left-40 transform -translate-y-1/2 translate-x-4 rounded-full p-2 bg-white border shadow z-40">
          <span className="text-xl">{isCollapsed ? '<' : '>'}</span>
        </button>
        
         {/* Category Bar */}
        <div className={`relative flex flex-col ${isCollapsed ? 'w-0' : 'w-48'} overflow-hidden transition-width duration-300 h-full rounded-r-4xl bg-[#0c0c0d] bg-opacity-90 z-48`}>
        <Categories/>
      </div>
    </div>
  )
}
