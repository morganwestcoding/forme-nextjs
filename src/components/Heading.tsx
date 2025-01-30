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
  center = false
}) => {
  const category = categories.find(category => category.label === label);
  const defaultBgColor = 'bg-gray-200';

  return ( 
    <div className={`${center ? 'text-center' : 'text-left'}`}>
      <div className="text-lg font-medium flex items-center justify-start mb-1">
        {title}  
        {label && category && (
          <div className={`drop-shadow-sm rounded px-3 py-1 mx-auto my-1 ml-3 text-xs font-light ${category ? category.color : defaultBgColor} text-white inline-block`}>
            {label}
          </div>
        )}
      </div>
    
      {subtitle && (
        <div className="font-light text-sm text-neutral-500 mb-2 ">
          {subtitle}
        </div>
      )}
      {/* Star icon with rating next to the subtitle */}
    </div>
   );
}
 
export default Heading;
