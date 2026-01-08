'use client';

import { 
  FieldErrors, 
  FieldValues, 
  UseFormRegister 
} from "react-hook-form";
import { useState, useEffect, ChangeEvent } from 'react';

interface TextAreaProps {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  rows?: number;
  maxLength?: number;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  placeholder = "",
  disabled,
  register,
  required,
  errors,
  rows = 4,
  maxLength,
  onChange
}) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (maxLength) {
      setCharCount(0);
    }
  }, [maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength) {
      setCharCount(e.target.value.length);
      if (e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
        setCharCount(maxLength);
      }
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full relative">
      <div className="relative">
        <textarea
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
          rows={rows}
          className={`
            peer
            w-full
            p-3
            pt-6 
            border-neutral-500
            bg-slate-50
            border
            rounded-sm
            outline-none
            transition
            resize-none
            disabled:opacity-70
            disabled:cursor-not-allowed
            pl-4
            ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
            ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
          `}
          onChange={handleChange}
        />
        <label 
          className={`
            absolute 
            text-sm
            duration-150 
            transform 
            -translate-y-3 
            top-5 
            origin-[0] 
            left-4
            peer-placeholder-shown:scale-100 
            peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75
            peer-focus:-translate-y-4
            ${errors[id] ? 'text-rose-500' : 'text-neutral-500'}
          `}
        >
          {label}
        </label>
      </div>
      
      {maxLength && (
        <span className="absolute top-2 right-2 text-xs text-gray-500">
          {charCount}/{maxLength}
        </span>
      )}
      
      {errors[id] && errors[id].message && (
        <span className="text-rose-500 text-xs mt-1 block">
          {errors[id].message?.toString()}
        </span>
      )}
    </div>
  );
}
 
export default TextArea;