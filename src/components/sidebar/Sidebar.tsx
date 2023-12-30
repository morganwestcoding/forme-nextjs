import { Home, FolderHeart, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";
import CloseFriends from "./CloseFriends";


export default function Sidebar() {
  return (
    <div className="sticky h-screen pt-8 ">
      <div className="w-4/5 h-screen rounded-lg bg-white shadow-md dark:shadow-lg dark:border dark:border-gray-600 p-10" >
        <ul className="list-none m-0 p-0">
          <li className="flex items-center mb-5">
            <Home className="mr-4" color="#C19065"/>
            <span>Home</span>
          </li>
          <li className="flex items-center mb-5">
            <Store className="mr-4" color="#C19065"/>
            <span>Market</span>
          </li>
          <li className="flex items-center mb-5">
            <FolderHeart className="mr-4" color="#C19065"/>
            <span>Favorites</span>
          </li>
          <li className="flex items-center mb-5">
            <FileQuestion className="mr-4" color="#C19065" />
            <span>Questions</span>
          </li>
          <li className="flex items-center mb-5">
            <Briefcase className="mr-4" color="#C19065"/>
            <span>Jobs</span>
          </li>
          <li className="flex items-center mb-5">
            <CalendarCheck className="mr-4" color="#C19065"/>
            <span>Events</span>
          </li>
        </ul>
        <div className="list-none p-0 m-0">
        <CloseFriends/>
        </div>
        
      </div>
    </div>
  )
}
