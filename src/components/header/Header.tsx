

import Logo from "./Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import DarkModeToggle from "@/components/header/DarkModeToggle";
import UserButton from "../UserButton";
import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import CreateChatButton from "./CreateChatButton";
import { User } from "@prisma/client";

interface HeaderProps {
  currentUser?: User | null;
}

const Header: React.FC<HeaderProps> = ({
  currentUser
}) => {
  console.log({ currentUser});
  return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900" style={{ borderBottom: '4px solid #B67171' }}>
          <nav className="flex flex-col sm:flex-row items-centerjustify-between items-center pl-2 bg-white dark:bg-gray-900 max-w-7xl mx-auto">
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