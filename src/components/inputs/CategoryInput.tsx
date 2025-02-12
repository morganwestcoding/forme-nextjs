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
        rounded-sm
        border
        p-4
        flex
        flex-col
        gap-3
        transition
        duration-200
        cursor-pointer
        bg-slate-50
        ${selected 
          ? `border-[${color}] bg-white shadow-sm` 
          : 'border-neutral-500 hover:border-neutral-400'
        }
      `}
    >
      <div className={`
        flex 
        items-center 
        gap-3 
        text-sm
        ${selected ? 'text-gray-900' : 'text-gray-600'}
      `}>
        <div className={`
          h-3 
          w-3 
          rounded-full 
          ${color}
          transition
          ${selected ? 'scale-110' : 'scale-100'}
        `} />
        <div className={`
          font-medium
          transition
          ${selected ? 'scale-105' : 'scale-100'}
        `}>
          {label}
        </div>
      </div>
    </div>
   );
}
 
export default CategoryInput;