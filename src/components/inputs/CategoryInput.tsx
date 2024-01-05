'use client';



interface CategoryBoxProps {
  color: string;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  color,
  label,
  selected,
  onClick
}) => {
  return ( 
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        border-2
        p-4
        flex
        
        flex-col
        gap-3
        hover:border-black
        transition
        cursor-pointer
        ${selected ? 'border-black' : 'border-gray-400'}
      `}
    >
      
      <div className="font-semibold">
      <span className={`h-6 w-6 rounded-full ${color} inline-block`}></span>
        {label}
      </div>
    </div>
   );
}
 
export default CategoryBox;