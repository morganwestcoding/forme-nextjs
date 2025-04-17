"use client";

import Logo from "../header/Logo";
import UserButton from "../UserButton";
import { SafeUser } from "@/app/types";

interface UnifiedHeaderProps {
  currentUser?: SafeUser | null;
  onMobileClose?: () => void;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  currentUser,
  onMobileClose
}) => {
  return (
    <div className="w-full px-4 pt-6 pb-2">
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-gray-100 rounded-xl hover:bg-[#DFE2E2] transition-colors duration-250">
          <div className="pl-5 pr-4 py-[0.125rem] flex items-center">
            <Logo variant="vertical" />
          </div>
          <div className="h-8 border-r pl-2 border-gray-300"></div>
          <div className="px-2.5 py-[0.125rem] flex items-center">
            <UserButton 
              currentUser={currentUser} 
              onMobileClose={onMobileClose} 
              compact={true} 
              noBg={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedHeader;