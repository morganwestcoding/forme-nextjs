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
      <div className="flex flex-col items-center w-56 h-full p-10 bg-[#ffffff] drop-shadow-sm" >
        <Logo/>
        <div className="flex flex-col item-center pt-9 text-xs font-bold text-[#000000]">
          MENU
        </div>
        
        <ul className="list-none m-0 p-0 ">
        
        {/* Home Icon with Tooltip */}
   
          <li className="flex items-center mb-5 pt-5">

          <CottageRoundedIcon className="w-6.5 h-6.5 text-[#000000]  cursor-pointer" onClick={() => router.push('/')}/>

                  <span className="ml-2 text-black text-xs font-bold uppercase">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="flex items-center mb-5">
 
            <StorefrontRoundedIcon className="w-6.5 h-6.5 text-[#000000] font-light cursor-pointer" onClick={() => router.push('/market')}/>
         
            <span className="ml-2 text-black text-xs font-bold uppercase">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="flex items-center mb-5">
 
          <BookmarkRoundedIcon className="w-6.5 h-6.5 text-[#000000] " onClick={() => router.push('/favorites')}/>
                

           
          <span className="ml-2 text-black text-xs font-bold uppercase">Favorites</span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="flex items-center mb-5">
     
          <WorkRoundedIcon className="w-6.5 h-6.5 text-[#000000] " />
             
          <span className="ml-2 text-black text-xs font-bold uppercase">Jobs</span>
            
       
          </li>
        

          <li className="flex items-center mb-5">
     
          <EventNoteRoundedIcon className="w-6.5 h-6.5 text-[#000000] " onClick={() => router.push('/reservations')}/>
              
          <span className="ml-2 text-black text-xs font-bold uppercase">Bookings</span>
            
          </li>

  
        </ul>
        
      
        </div>
        
      </div>

  )
}
