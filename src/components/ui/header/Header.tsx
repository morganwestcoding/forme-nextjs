
'use client'

import Logo from "./Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import DarkModeToggle from "@/components/DarkModeToggle";

async function Header() {
  const session = await getServerSession(authOptions);
  return (
        <header className="sticky top-0 z-50 bg-white">
          <nav className="flex justify-between items-center">
            <Logo />

            <div className="flex-1 flex items-center justify-end space-x-4">
              {/* LanguageSelect */}

              {/* Session && (
                  
             ) */}

             <DarkModeToggle/>
            </div>
          </nav>

          {/* Uprgrade */}
        </header>
  );
};

export default Header