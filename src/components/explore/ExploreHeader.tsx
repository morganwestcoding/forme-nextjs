'use client';

import { useRouter } from 'next/navigation';

interface ExploreHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  activeTab,
  setActiveTab
}) => {
  const router = useRouter();
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: 'Trending' },
    { id: 'stores', label: 'Stores' },
    { id: 'events', label: 'Events' },
    { id: 'products', label: 'Products' },
  ];
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Explore</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/search')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button
            onClick={() => router.push('/filters')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              py-3 px-6 font-medium text-sm whitespace-nowrap
              transition-colors
              ${activeTab === tab.id 
                ? 'text-[#60A5FA] border-b-2 border-[#60A5FA]' 
                : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreHeader;