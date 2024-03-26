'use client';
import { categories } from '../Categories';
interface ListingCategoryProps {
  label: string;
}

const ListingCategory: React.FC<ListingCategoryProps> = ({ label }) => {
  // Find the category by label to get its color
  const category = categories.find(category => category.label === label);

  // Default background color if the category is not found
  const defaultBgColor = 'bg-gray-200';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col">
            <div 
              className={`text-sm font-semibold p-2 rounded-xl text-white ${category ? category.color : defaultBgColor}`}
            >
              {label}
            </div>
        </div>
      </div>
    </div>
  );
}
 
export default ListingCategory;
