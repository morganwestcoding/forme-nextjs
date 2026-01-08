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
    <div className={`${center ? 'text-center' : 'text-left'} space-y-1.5`}>
      <div className="text-xl font-semibold tracking-tight flex items-center justify-start text-gray-900 dark:text-white">
        {title}
        {label && category && (
          <div className={`rounded-lg px-3 py-1.5 ml-3 text-xs font-medium shadow-sm ${category ? category.color : defaultBgColor} text-white inline-flex items-center`}>
            {label}
          </div>
        )}
      </div>

      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {subtitle}
        </div>
      )}
    </div>
   );
}
 
export default Heading;
