

import Logo from "./Logo";
import DarkModeToggle from "@/components/header/DarkModeToggle";
import UserButton from "../UserButton";


import CreateChatButton from "./CreateChatButton";

import { SafeUser } from "@/app/types";
import Search from "./Search";

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({
  currentUser
}) => {
  console.log({ currentUser});
  return (
        <header className="sticky top-0 z-50 dark:bg-gray-900 pr-10 pt-5">
          <nav className="flex flex-col sm:flex-row items-centerjustify-between items-center dark:bg-gray-900 max-w-7xl mx-auto">
           
            <Search/>
            <div className="flex-1 flex items-center justify-end space-x-4">
              {/* LanguageSelect */}

              <>
              <CreateChatButton />
              </>
             
             <DarkModeToggle/>
             <UserButton currentUser={currentUser}/>
            
            
            </div>
          </nav>

         
        </header>
  );
};

export default Header