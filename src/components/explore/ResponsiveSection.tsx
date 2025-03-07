'use client';

import { useRouter } from 'next/navigation';

interface ResponsiveSectionProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
  className?: string;
}

const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  title,
  viewAllLink,
  children,
  className = ''
}) => {
  const router = useRouter();
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {viewAllLink && (
          <button 
            className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
            onClick={() => router.push(viewAllLink)}
          >
            View all
          </button>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default ResponsiveSection;