import { Home, FolderHeart, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";
import CloseFriends from "./CloseFriends";
import Logo from "../header/Logo";


export default function Sidebar() {
  return (
    <div className="sticky top-0 flex h-screen">
      <div className="flex flex-col items-center w-48 h-full rounded-l-2xl bg-[#ececec] bg-opacity-40 shadow-md dark:shadow-lg dark:border dark:border-gray-600 p-10" >
        <Logo/>
        <ul className="list-none m-0 p-0">
          <li className="flex items-center mb-5 pt-10">
            <Home size={28} strokeWidth={1.5} color="#7d8085"/>
          
          </li>
          <li className="flex items-center mb-5">
            <Store size={28} strokeWidth={1.5} color="#7d8085"/>
            
          </li>
          <li className="flex items-center mb-5">
            <FolderHeart size={28} strokeWidth={1.5} color="#7d8085"/>
          
          </li>
          <li className="flex items-center mb-5">
            <FileQuestion size={28} strokeWidth={1.5} color="#7d8085" />
            
          </li>
          <li className="flex items-center mb-5">
            <Briefcase size={28} strokeWidth={1.5} color="#7d8085"/>
          
          </li>
          <li className="flex items-center mb-5">
            <CalendarCheck size={28} strokeWidth={1.5} color="#7d8085"/>
            
          </li>
        </ul>
        <div className="list-none p-0 m-0">
        <CloseFriends/>
        </div>
        
      </div>
    </div>
  )
}
