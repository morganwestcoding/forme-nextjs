"use client"

import { Home, Star, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { IoStorefrontOutline } from "react-icons/io5";
import { BsBookmarks } from "react-icons/bs";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { LiaSuitcaseSolid } from "react-icons/lia";
import { HiOutlineCalendarDays } from "react-icons/hi2"

import CloseFriends from "./CloseFriends";
import Logo from "../header/Logo";
import Categories from "../Categories";
import { useState } from "react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse

  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  return (
    <div className="sticky top-0 flex h-screen">
      <div className="flex flex-col items-center w-48 h-full rounded-l-2xl bg-[#F9FCFF] bg-opacity-40 shadow-md dark:shadow-lg dark:border dark:border-gray-600 p-10" >
        <Logo/>
        <div className="flex flex-col item-center pt-9 text-xs font-bold text-[#7d8085] opacity-75">
          MENU
        </div>
        <ul className="list-none m-0 p-0">

          <li className="flex items-center mb-5 pt-5">
            <IoHomeOutline size={26} color="#7d8085" opacity="75%"/>
          
          </li>
          <li className="flex items-center mb-5">
            <IoStorefrontOutline size={26} strokeWidth={0.025} color="#7d8085" opacity="75%"/>
            
          </li>
          <li className="flex items-center mb-5">
            
            <BsBookmarks size={26} color="#7d8085" opacity="75%"/>
          
          </li>
          <li className="flex items-center mb-5">
            <LiaSuitcaseSolid size={26} color="#7d8085" opacity="75%"/>
          
          </li>
          <li className="flex items-center mb-4">
            <HiOutlineCalendarDays size={26} color="#7d8085" opacity="75%"/>
            
          </li>
        </ul>
        <div className="list-none p-0 m-0">
        <CloseFriends/>
      
        </div>
        
      </div>
      
       
        {/* Arrow button when expanded */}
        <button onClick={toggleCollapse} className="fixed top-1/2 left-40 transform -translate-y-1/2 translate-x-4 rounded-full p-2 bg-white border shadow z-50">
          <span className="text-xl">{isCollapsed ? '<' : '>'}</span>
        </button>
        
         {/* Category Bar */}
        <div className={`relative flex flex-col ${isCollapsed ? 'w-0' : 'w-48'} overflow-hidden transition-width duration-300 h-full rounded-r-4xl bg-[#9fa2a6] bg-opacity-40 border-l`}>
        <Categories/>
      </div>
    </div>
  )
}
