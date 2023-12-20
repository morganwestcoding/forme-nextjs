

import Logo from "./Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import UserButton from "../UserButton";
import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";


async function Header() {
  const session = await getServerSession(authOptions);
  console.log(session);
  return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900">
          <nav className="flex flex-col sm:flex-row items-centerjustify-between items-center p-2 pl-2 bg-white dark:bg-gray-900 max-w-7xl mx-auto">
            <Logo />
            
            <div className="flex-1 flex items-center justify-end space-x-4">
              {/* LanguageSelect */}

             {session ? (
              <>
              <Link href={'/chat'} prefetch={false}>
              <MessageSquareIcon className="text-black dark:text-white" />
              </Link>
              </>
             
             ) : (
              <Link href="/pricing">
                Pricing
              </Link>
             )}
             <DarkModeToggle/>
             <UserButton session={session}/>
            
            
            </div>
          </nav>

          {/* Uprgrade */}
        </header>
  );
};

export default Header