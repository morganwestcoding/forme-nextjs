'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { 
  FieldErrors, 
  FieldValues, 
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors,
  className?: string;
  height?: string;
  maxLength?: number;
  watch?: UseFormWatch<FieldValues>;
  setValue?: UseFormSetValue<FieldValues>;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  label,
  type = "text",
  placeholder = "",
  disabled, 
  formatPrice,
  register,
  required,
  errors,
  className = "",
  height = "65px",
  maxLength,
  watch,
  setValue
}, ref) => {
  const value = watch ? watch(id) : '';
  const [charCount, setCharCount] = useState(value ? value.length : 0);

  useEffect(() => {
    setCharCount(value ? value.length : 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    e.target.value = newValue;  // Directly update the input value
    if (setValue) {
      setValue(id, newValue, { shouldValidate: true });
    }
  };

  return (
    <div className={`w-full relative ${className}`}>
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
          maxLength,
          onChange: handleChange,
          value: value ? value.slice(0, maxLength) : ''  // Ensure the initial value is also limited
        })}
        placeholder={placeholder} 
        type={type}
        style={{ height }}
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
        maxLength={maxLength}  // Add HTML maxLength attribute
        ref={ref}
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
        <div className="text-sm text-gray-500 absolute right-2 bottom-2">
          {Math.max(maxLength - charCount, 0)}
        </div>
      )}
    </div>
   );
});

Input.displayName = 'Input';

export default Input;