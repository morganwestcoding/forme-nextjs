'use client';

import useFavorite from "@/app/hooks/useFavorite";
import { SafeUser } from "@/app/types";

interface HeartButtonProps {
  listingId: string;
  currentUser?: SafeUser | null;
  variant?: 'default' | 'listingHead';
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser,
  variant = 'default'
}) => {
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId,
    currentUser
  });

  if (variant === 'listingHead') {
    return (
      <div
        onClick={toggleFavorite}
        className="         
          relative
          flex 
          items-center 
          justify-center 
          bg-[#5E6365]
          rounded-full 
          p-3
          border
          border-[#5E6365]
          cursor-pointer 
          shadow-sm
          transform
          transition-all
          duration-500
          ease-out
          hover:shadow-[#5E6365]/50
          hover:shadow-sm
          overflow-hidden
          group
          before:content-['']
          before:absolute
          before:w-12
          before:h-12
          before:bg-white/10
          before:top-1/2
          before:left-1/2
          before:-translate-x-1/2
          before:-translate-y-1/2
          before:rounded-full
          before:scale-0
          before:opacity-0
          hover:before:scale-150
          hover:before:opacity-100
          before:transition-all
          before:duration-500
          before:ease-out"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="19" 
          height="19" 
          color="#000000" 
          fill={hasFavorited ? '#b1dafe' : 'none'} 
        >
          <path 
            d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={toggleFavorite}
className="          relative
          flex 
          items-center 
          justify-center 
          bg-[#5E6365]
          rounded-full 
          p-3
          border
          border-white
          cursor-pointer 
          shadow-sm
          hover:shadow-[#5E6365]/50
          hover:shadow-sm
          overflow-hidden
          group
          backdrop-blur-sm
          
          bg-white/10
          mt-6
          mr-6
          left-1/2
          -translate-x-1/2
          -translate-y-1/2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
      >
        <path
          d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={hasFavorited ? '#b1dafe' : 'rgba(0, 0, 0, 0.35)'}
        />
      </svg>
    </div>
  );
}

export default HeartButton;