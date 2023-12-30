

import Logo from "./Logo";
import DarkModeToggle from "@/components/header/DarkModeToggle";
import UserButton from "../UserButton";

import CreateChatButton from "./CreateChatButton";

import { SafeUser } from "@/app/types";

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({
  currentUser
}) => {
  console.log({ currentUser});
  return (
        <header className="sticky top-0 z-50 bg-[#B67171] dark:bg-gray-900" style={{ borderBottom: '4px solid #B67171' }}>
          <nav className="flex flex-col sm:flex-row items-centerjustify-between items-center pl-2 bg-[#B67171] dark:bg-gray-900 max-w-7xl mx-auto">
            <Logo />
            
            <div className="flex-1 flex items-center justify-end space-x-4">
              {/* LanguageSelect */}

              <>
              <CreateChatButton />
              </>
             
             <DarkModeToggle/>
             <UserButton />
            
            
            </div>
          </nav>

          {/* Uprgrade */}
        </header>
  );
};

export default Header