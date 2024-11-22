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
        rounded-md
        shadow-sm
        p-4
        flex
        group
        hover:bg-[#e2e8f0]
        hover:border-[#e2e8f0]
        flex-col
        gap-3
        transition
        cursor-pointer
        ${selected ? 'border border-white' : 'border border-white'}
        ${selected ? 'bg-[#7b7b7b]' : 'bg-transparent'}
      `}
    >
      <div className="group group-hover:text-black flex items-center gap-5 font-light text-sm text-[white] ">
        <span className={`h-6 w-6 rounded-full ${color} inline-block`}></span>
        {label}
      </div>
    </div>
   );
}
 
export default CategoryInput;