'use client';

import { 
  FieldErrors, 
  FieldValues, 
  UseFormRegister 
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";
import { useState, useEffect } from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  placeholder = "",
  disabled, 
  formatPrice,
  register,
  required,
  errors,
  maxLength,
  onChange
}) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (maxLength) {
      setCharCount(0);
    }
  }, [maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle maxLength logic
    if (maxLength) {
      setCharCount(e.target.value.length);
      if (e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
        setCharCount(maxLength);
      }
    }
    
    // Call the passed onChange handler if it exists
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full relative">
      {formatPrice && (
        <BiDollar
          size={24}  
          className="
            text-neutral-700
            absolute
            top-5
            left-2
          "
        />
      )}
      <input
        id={id}
        disabled={disabled}
        {...register(id, { 
          required,
          maxLength: maxLength ? {
            value: maxLength,
            message: `Maximum ${maxLength} characters allowed`
          } : undefined
        })}
        placeholder={placeholder} 
        type={type}
        className={`
          peer
          w-full
          p-4
          pt-6 
          font-light
          border-white 
          bg-transparent
          border
          rounded-md
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          ${formatPrice ? 'pl-9' : 'pl-4'}
          ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
          ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
        `}
        onChange={handleChange}
      />
      <label 
        className={`
          absolute 
          text-md
          duration-150 
          transform 
          -translate-y-3 
          top-5 
          origin-[0] 
          ${formatPrice ? 'left-9' : 'left-4'}
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75
          peer-focus:-translate-y-4
          ${errors[id] ? 'text-rose-500' : 'text-zinc-400'}
        `}
      >
        {label}
      </label>
      {maxLength && (
        <span className="absolute top-2 right-2 text-xs text-gray-500">
          {charCount}/{maxLength}
        </span>
      )}
    </div>
   );
}
 
export default Input;