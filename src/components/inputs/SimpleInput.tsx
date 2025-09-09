// Create this as a temporary test file: components/inputs/SimpleInput.tsx
'use client';

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface SimpleInputProps {
  id: string;
  label?: string;  
  type?: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const SimpleInput: React.FC<SimpleInputProps> = ({
  id,
  label,
  type = "text",
  disabled, 
  register,
  required,
  errors,
}) => {
  console.log(`🔍 SimpleInput ${id} rendering`);

  return (
    <div className="w-full relative">
      <input
        id={id}
        disabled={disabled}
        {...register(id, { 
          required: required ? "This field is required" : false,
          // NO PATTERN VALIDATION - just basic required
        })}
        placeholder=" " 
        type={type}
        className={`
          peer w-full p-3 pt-6 bg-neutral-50 border border-neutral-300 rounded-lg
          outline-none transition disabled:opacity-70 disabled:cursor-not-allowed
          focus:border-black
          ${errors[id] ? 'border-rose-500' : ''}
        `}
        onChange={(e) => {
          console.log(`🔍 SimpleInput ${id} changed:`, e.target.value);
          console.log(`🔍 SimpleInput ${id} has spaces:`, e.target.value.includes(' '));
        }}
        onKeyDown={(e) => {
          console.log(`🔍 SimpleInput ${id} key:`, e.key);
          // Allow ALL keys - no restrictions
        }}
        autoComplete={id === "name" ? "name" : "off"}
        spellCheck={true}
      />
      
      {label && (
        <label 
          htmlFor={id}
          className={`
            absolute text-sm duration-150 transform -translate-y-3 top-5 origin-[0] 
            pointer-events-none left-4
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75 peer-focus:-translate-y-4
            ${errors[id] ? 'text-rose-500' : 'text-neutral-500'}
          `}
        >
          {label}
        </label>
      )}
      
      {errors[id] && (
        <span className="text-rose-500 text-xs mt-1 block">
          {String(errors[id]?.message || `Please check your ${label || id}`)}
        </span>
      )}
    </div>
  );
};

export default SimpleInput;