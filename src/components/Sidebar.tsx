import { Home, FolderHeart, FileQuestion, Briefcase, Store, CalendarCheck } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="sticky h-100vh top-50px bg-slate-400">
      <div className="p-10">
        <ul className="list-none m-0 p-0">
          <li className="flex items-center mb-5">
            <Home className="mr-4"/>
            <span>Home</span>
          </li>
          <li className="flex items-center mb-5">
            <Store className="mr-4"/>
            <span>Market</span>
          </li>
          <li className="flex items-center mb-5">
            <FolderHeart className="mr-4"/>
            <span>Favorites</span>
          </li>
          <li className="flex items-center mb-5">
            <FileQuestion className="mr-4"/>
            <span>Questions</span>
          </li>
          <li className="flex items-center mb-5">
            <Briefcase className="mr-4"/>
            <span>Jobs</span>
          </li>
          <li className="flex items-center mb-5">
            <CalendarCheck className="mr-4"/>
            <span>Events</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
