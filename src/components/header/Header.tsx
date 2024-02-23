

import Logo from "./Logo";
import AddListing from "./AddListing";
import UserButton from "../UserButton";
import { SafePost } from "@/app/types";

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
        <header className="stickytop-0 dark:bg-gray-900 pr-24 pt-7 ">
          <nav className="flex flex-col sm:flex-row items-centerjustify-between items-center dark:bg-gray-900 max-w-7xl mx-auto">
           
            <Search/>
            <div className="flex-1 flex items-center justify-end space-x-4">
              {/* LanguageSelect */}

              <>
              <CreateChatButton />
              </>
             
             <AddListing currentUser={currentUser}/>
             <UserButton currentUser={currentUser}
             data={{} as SafePost}  />
            
            
            </div>
          </nav>

         
        </header>
  );
};

export default Header