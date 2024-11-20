// src/components/header/Inbox.tsx

'use client'
import { useState } from 'react';
import { SafeUser } from "@/app/types";
import InboxModal from '../modals/InboxModal';

interface InboxProps {
  currentUser: SafeUser | null;
}

const Inbox: React.FC<InboxProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="flex items-center justify-center bg-[#3E4142] backdrop-blur-lg border border-[#3E4142] rounded-full p-3 cursor-pointer shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded-full focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-25 hover:bg-white hover:bg-opacity-10 hover:text-accent-foreground" 
        onClick={() => setIsOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} color={"#ffffff"} fill={"none"}>
          <path d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.01576 13.4756C2.08114 16.5411 2.11382 18.0739 3.24495 19.2093C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.755 19.2093C21.8862 18.0739 21.9189 16.5411 21.9842 13.4756C22.0053 12.4899 22.0053 11.51 21.9842 10.5244C21.9189 7.45883 21.8862 5.92606 20.755 4.79063C19.6239 3.6552 18.0497 3.61565 14.9012 3.53654C12.9607 3.48778 11.0393 3.48778 9.09882 3.53653C5.95033 3.61563 4.37608 3.65518 3.24495 4.79062C2.11382 5.92605 2.08113 7.45882 2.01576 10.5243C1.99474 11.51 1.99474 12.4899 2.01576 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <InboxModal isOpen={isOpen} onClose={() => setIsOpen(false)} currentUser={currentUser} />
    </>
  )
}

export default Inbox;