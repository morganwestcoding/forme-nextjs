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
      <div className="flex flex-col items-center w-52 h-full p-10 bg-white  backdrop-blur-full bg drop-shadow-sm rounded-tr-2xl" >
        <Logo/>

        <ul className="list-none m-0 p-0 flex flex-col items-center ">
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-inner bg-[#b1dafe] border-white w-36" onClick={() => router.push('/')}>
          <div className="flex flex-col  hover:bg-white rounded-full p-1 cursor-pointer" >
            
          <CottageRoundedIcon className="w-4 h-4 hover:text-[#48DBFB] text-[#ffffff]"/>
          </div>
                  <span className="ml-6 text-white text-xs font-normal hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-lg border shadow-sm  w-36 bg-white">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/market')}>
            <StorefrontRoundedIcon className="w-4 h-4 text-[#d3d2d2]" />
            </div>
            <span className="ml-6 text-[#d3d2d2] text-xs font-normal ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-center justify-start mb-5 p-2  rounded-lg  w-36 bg-white border shadow-sm">
          <div className="flex flex-col rounded-full p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
          <BookmarkRoundedIcon className="w-4 h-4 text-[#d3d2d2] "/>
          </div>     

           
          <span className="ml-6 text-[#d3d2d2] text-xs font-normal ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-center justify-start mb-5 p-2  rounded-lg border shadow-sm  w-36">
          <div className="flex flex-col rounded-lg p-1 cursor-pointer">
          <WorkRoundedIcon className="w-4 h-4 text-[#d3d2d2]" />
          </div>
          <span className="ml-6 text-[#d3d2d2] text-xs font-normal ">Jobs</span>
            
       
          </li>
        

          <li className="flex items-center justify-start mb-5 p-2  rounded-lg border shadow-sm  w-36">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/reservations')}>
          <EventNoteRoundedIcon className="w-4 h-4 text-[#d3d2d2]" />
          </div>
          <span className="ml-6 text-[#d3d2d2] text-xs font-normal ">Bookings</span>
            
          </li>
          
       </ul>
          
        </div>
       
        
      </div>

  )
}
