// components/FilterTab.tsx
'use client';

interface FilterTabProps {
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ isActive = false, onClick }) => {
    return (
      <div 
        className={`
          z-10 tabbed round block float-right p-3
          bg-white mr-[46px] relative cursor-pointer
          transition-all duration-250 transform rotate-90
          origin-bottom-left shadow-sm
          before:block before:content-[''] before:absolute before:top-0 
          before:h-full before:w-14 before:bg-white before:right-[-24px]
          before:transform before:skew-x-[30deg] before:shadow-sm
          before:transition-all before:duration-250 before:rounded-tr-lg
          after:block after:content-[''] after:absolute after:top-0
          after:h-full after:w-14 after:bg-white after:left-[-24px]
          after:transform after:skew-x-[-30deg] after:shadow-sm
          after:transition-all after:duration-250 after:rounded-tl-lg
          ${isActive ? 'bg-black text-white before:bg-black after:bg-black' : ''}
        `}
        onClick={onClick}
      >
        <svg 
          className="relative z-20 mb-1 -mt-0.5"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="18" 
          height="18" 
          color={isActive ? "#a2a2a2" : "#000000"} 
          fill="none"
        >
    <path d="M15.5 6.5C15.5 8.433 13.933 10 12 10C10.067 10 8.5 8.433 8.5 6.5C8.5 4.567 10.067 3 12 3C13.933 3 15.5 4.567 15.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M22 17.5C22 19.433 20.433 21 18.5 21C16.567 21 15 19.433 15 17.5C15 15.567 16.567 14 18.5 14C20.433 14 22 15.567 22 17.5Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M9 17.5C9 19.433 7.433 21 5.5 21C3.567 21 2 19.433 2 17.5C2 15.567 3.567 14 5.5 14C7.433 14 9 15.567 9 17.5Z" stroke="currentColor" stroke-width="1.5" />

        </svg>
      </div>
    );
  };

export default FilterTab;
