'use client';
import { categories } from "./Categories";

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  label?: string;
}

const Heading: React.FC<HeadingProps> = ({ 
  title, 
  subtitle,
  label,
  center = false // Default to false if not provided
}) => {
  const category = categories.find(category => category.label === label);
  const defaultBgColor = 'bg-gray-200';

  return ( 
    <div className={`${center ? 'text-center' : 'text-left'}`}>
      <div className="text-2xl font-bold flex items-center justify-start">
        {title}  
        {label && category && (
          <div className={`drop-shadow-sm rounded-lg px-3 py-1 mx-auto my-1 ml-3 text-xs font-light ${category ? category.color : defaultBgColor} text-white inline-block`}>
            {label}
          </div>
        )}
      </div>
      {subtitle && (
        <div className="font-light text-neutral-500 mt-2">
          {subtitle}
        </div>
      )}
    </div>
   );
}
 
export default Heading;
