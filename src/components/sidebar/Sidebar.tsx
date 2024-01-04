"use client"

import { Home, Star, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";
import { AiFillHome } from "react-icons/ai";
import { MdStore } from "react-icons/md";
import { BiSolidBookmarks } from "react-icons/bi";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { FaSuitcase } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";

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
        <ul className="list-none m-0 p-0">
          <li className="flex items-center mb-5 pt-10">
            <AiFillHome size={28} strokeWidth={1.5} color="#7d8085"/>
          
          </li>
          <li className="flex items-center mb-5">
            <MdStore size={28} color="#7d8085"/>
            
          </li>
          <li className="flex items-center mb-5">
            
            <BiSolidBookmarks size={28} color="#7d8085" />
          
          </li>
          <li className="flex items-center mb-5">
            <BsFillQuestionCircleFill size={28} color="#7d8085" />
            
          </li>
          <li className="flex items-center mb-5">
            <FaSuitcase size={28} color="#7d8085"/>
          
          </li>
          <li className="flex items-center mb-5">
            <IoCalendar size={28} strokeWidth={1.5} color="#7d8085"/>
            
          </li>
        </ul>
        <div className="list-none p-0 m-0">
        <CloseFriends/>
        <button onClick={toggleCollapse} className={`absolute top-1/2 right-0 transform -translate-y-1/2 -translate-x-1/2 rounded-full p-2 bg-white border shadow ${isCollapsed ? '' : 'hidden'}`}>
          <span className="text-xl">{'>'}</span>
        </button>
        </div>
        
      </div>
       {/* Category Bar */}
       <div className={`relative flex flex-col ${isCollapsed ? 'w-0' : 'w-48'} overflow-hidden transition-width duration-300 h-full rounded-r-2xl bg-[#9fa2a6] bg-opacity-40 border-l`}>
        {/* Arrow button when expanded */}
        <button onClick={toggleCollapse} className={`absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 rounded-full p-2 bg-white border shadow ${isCollapsed ? 'hidden' : ''}`}>
          <span className="text-xl">{'<'}</span>
        </button>
        <Categories/>
      </div>
    </div>
  )
}
