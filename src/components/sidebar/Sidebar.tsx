"use client"


import { useRouter } from "next/navigation";
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

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
  
  const images = [
    "/assets/business-2.jpg",
    "/assets/business-1.jpg",
    "/assets/business-4.jpg",
    "/assets/business-3.jpg",
    "/assets/skyline.jpg",
    "/assets/scenic view.jpeg",
    "/assets/water-sample.jpg",
    "/assets/coral-sample.jpg",
    "/assets/swimmer-sample.jpg",
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };
  
  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };
  

  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  return (
    
    <div className="fixed top-0 flex h-screen z-50">
      <div className="flex flex-col items-center w-52 h-full p-10 bg-white  backdrop-blur-full bg drop-shadow-sm rounded-tr-2xl" >
        <Logo/>
        <span className="ml-5 text-[#a2a2a2] text-xs font-light hover:text-white ">Menu</span>
        <ul className="list-none m-0 p-0 flex flex-col items-center ">
   
          <li className="flex items-center justify-start mb-5 p-2  rounded-xl border shadow-inner bg-[#b1dafe] border-[#b1dafe] w-36" onClick={() => router.push('/')}>
          <div className="flex flex-col   rounded-full p-1 cursor-pointer" >
            
          <CottageOutlinedIcon className="w-4 h-4  text-[#ffffff]"/>
          </div>
                  <span className="ml-5 text-white text-xs font-light hover:text-white">Home</span>

          </li>


          {/* Market Icon with Tooltip */}
   
          <li className="group hover:text-white flex items-center  justify-start mb-5 p-2 hover:bg-[#e2e8f0] rounded-xl border shadow-sm  w-36 bg-white">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/market')}>
            <StorefrontOutlinedIcon className="w-4 h-4 group-hover:text-white text-[#a2a2a2]" />
            </div>
            <span className="ml-5 text-[#a2a2a2] text-xs font-light group-hover:text-white ">Market</span>
        
            </li>
        

           {/* Favorites Icon with Tooltip */}
       
            <li className="group flex items-center hover:text-white justify-start mb-5 p-2  rounded-xl hover:bg-[#e2e8f0]  w-36 bg-white border shadow-sm">
          <div className="flex  flex-col rounded-full p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
          <BookmarkBorderOutlinedIcon className="group-hover:text-white w-4 h-4 text-[#a2a2a2] "/>
          </div>     

           
          <span className="ml-5 text-[#a2a2a2] group-hover:text-white text-xs font-light ">Favorites </span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
          <li className="group flex items-center hover:text-white justify-start mb-5 p-2  hover:bg-[#e2e8f0] rounded-xl border shadow-sm  w-36">
          <div className="flex flex-col rounded-xl p-1 cursor-pointer">
          <WorkOutlineOutlinedIcon className="group-hover:text-white w-4 h-4 text-[#a2a2a2]" />
          </div>
          <span className="ml-5 group-hover:text-white text-[#a2a2a2] text-xs font-light ">Jobs</span>
            
       
          </li>
        

          <li className="group flex items-center hover:text-white justify-start mb-5 p-2 hover:bg-[#e2e8f0]  rounded-xl border shadow-sm  w-36 ">
          <div className="flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/reservations')}>
          <CalendarMonthOutlinedIcon className="group-hover:text-white w-4 h-4 text-[#a2a2a2]" />
          </div>
          <span className="ml-5 text-[#a2a2a2] text-xs group-hover:text-white font-light ">Bookings</span>
            
          </li>

          <span className="ml-5 text-[#a2a2a2] text-xs font-light hover:text-white ">Genre</span>
          {/* Categories */}
          <li className="relative flex  items-center justify-center mb-5 p-2 rounded-xl shadow w-36 h-32 bg-[#b1dafe]">
  <div className="absolute left-0 z-10 cursor-pointer" onClick={handlePrevClick}>
    <NavigateBeforeRoundedIcon className="w-6 h-6 text-white" />
  </div>
  <span className=" text-[#ffffff] text-xs group-hover:text-white font-light ">Default</span>
  <div className="absolute right-0 z-10 cursor-pointer" onClick={handleNextClick}>
    <NavigateNextRoundedIcon className="w-6 h-6 text-white"  />
  </div>
</li>

           {/* Categories End */}
       </ul>
          
        </div>
       
        
      </div>

  )
}
