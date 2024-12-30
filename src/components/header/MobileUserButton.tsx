// components/MobileUserButton.tsx
'use client';

import { useState } from "react";
import { SafeUser } from "@/app/types";
import Avatar from "../ui/avatar";

interface MobileUserButtonProps {
  currentUser?: SafeUser | null;
}

const MobileUserButton: React.FC<MobileUserButtonProps> = ({
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        <Avatar src={currentUser?.image ?? undefined} />
      </div>
    </>
  );
}

export default MobileUserButton;