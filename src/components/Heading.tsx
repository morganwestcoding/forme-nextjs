'use client';
import { categories } from "./Categories";
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';

// Updated interface without state and city
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
      <div className="text-lg font-medium flex items-center justify-start mb-2">
        {title}  
        {label && category && (
          <div className={`drop-shadow-sm rounded px-3 py-1 mx-auto my-1 ml-3 text-xs font-light ${category ? category.color : defaultBgColor} text-white inline-block`}>
            {label}
          </div>
        )}
      </div>
    
      {subtitle && (
        <div className="font-light text-neutral-500 -mb-1 ">
          {subtitle}
        </div>
      )}
      {/* Star icon with rating next to the subtitle */}
    </div>
   );
}
 
export default Heading;
