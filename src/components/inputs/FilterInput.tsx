// components/inputs/FilterInput.tsx
// Create a new component specifically for filter inputs

'use client';

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface FilterInputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const FilterInput: React.FC<FilterInputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  register,
  errors,
}) => {
  return (
    <div className="w-full relative h-[62px]">
      <input
        id={id}
        disabled={disabled}
        {...register(id)}
        placeholder=" "
        type={type}
        className={`
          peer
          w-full
          h-[62px]
          font-light 
          bg-transparent 
          border-[1px]
          border-white
          text-white
          rounded-[0.4rem]
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          pl-4
          ${errors[id] ? 'border-rose-500' : 'border-white'}
          ${errors[id] ? 'focus:border-rose-500' : 'focus:border-white'}
        `}
      />
      <label
        className={`
          absolute
          text-sm
          duration-150 
          transform 
          -translate-y-3 
          top-5 
          z-10 
          origin-[0] 
          left-4
        
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75
          peer-focus:-translate-y-4
          ${errors[id] ? 'text-rose-500' : 'text-[#a2a2a2]'}
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default FilterInput;