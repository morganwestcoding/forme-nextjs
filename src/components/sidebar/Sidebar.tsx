"use client"


import { useRouter } from "next/navigation";
import Link from "next/link";
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
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
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-inner bg-[#b1dafe] border-[#b1dafe] w-36" onClick={() => router.push('/')}>
          <div className="flex flex-col  hover:bg-white rounded-full p-1 cursor-pointer" >
            
          <CottageOutlinedIcon className="w-4 h-4  text-[#ffffff]"/>
          </div>
                  <span className="ml-6 text-white text-xs font-light hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-sm  w-36 bg-white">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/market')}>
            <StorefrontOutlinedIcon className="w-4 h-4 text-[#a2a2a2]" />
            </div>
            <span className="ml-6 text-[#a2a2a2] text-xs font-light ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-center justify-start mb-5 p-2  rounded-xl  w-36 bg-white border shadow-sm">
          <div className="flex flex-col rounded-full p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
          <BookmarkBorderOutlinedIcon className="w-4 h-4 text-[#a2a2a2] "/>
          </div>     

           
          <span className="ml-6 text-[#a2a2a2] text-xs font-light ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-sm  w-36">
          <div className="flex flex-col rounded-xl p-1 cursor-pointer">
          <WorkOutlineOutlinedIcon className="w-4 h-4 text-[#a2a2a2]" />
          </div>
          <span className="ml-6 text-[#a2a2a2] text-xs font-light ">Jobs</span>
            
       
          </li>
        

          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-sm  w-36">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/reservations')}>
          <CalendarMonthOutlinedIcon className="w-4 h-4 text-[#a2a2a2]" />
          </div>
          <span className="ml-6 text-[#a2a2a2] text-xs font-light ">Bookings</span>
            
          </li>
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-sm  w-36 h-36">

          </li>
          
       </ul>
          
        </div>
       
        
      </div>

  )
}
