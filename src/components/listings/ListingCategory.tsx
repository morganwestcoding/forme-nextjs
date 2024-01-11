'use client';



interface CategoryViewProps {
  label: string,
  description: string
}

const CategoryView: React.FC<CategoryViewProps> = ({ 
  label,
  description
 }) => {
  return ( 
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center gap-4">
        
        <div className="flex flex-col">
            <div 
              className="text-lg font-semibold"
            >
              {label}
            </div>
            <div 
              className="text-neutral-500 font-light"
            >
              {description}
            </div>
        </div>
      </div>
    </div>
   );
}
 
export default CategoryView;