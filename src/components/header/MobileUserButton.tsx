// components/MobileUserButton.tsx
'use client';

import { useState } from "react";
import { SafeUser } from "@/app/types";
import Avatar from "../ui/avatar";
import MobileUserModal from "../modals/MobileUserModal";

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
      <MobileUserModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
}

export default MobileUserButton;