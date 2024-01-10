'use client';



interface CategoryInputProps {
  color: string;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
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
        bg-[#F9FCFF] 
        bg-opacity-40 
        shadow-md 
        flex-col
        gap-3
        hover:border-white
        transition
        cursor-pointer
        ${selected ? 'border-white' : 'border-[#7d8085]'}
      `}
    >
      
      <div className="flex items-center gap-2 font-semibold text-xs uppercase text-[#7d8085]">
      <span className={`h-6 w-6 rounded-full ${color} inline-block `}></span>
        {label}
      </div>
    </div>
   );
}
 
export default CategoryInput;