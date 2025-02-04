'use client';

import { 
  FieldErrors, 
  FieldValues, 
  UseFormRegister 
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";
import { useState, useEffect, ChangeEvent } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
  showPasswordValidation?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
}

interface PasswordValidation {
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
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
  onChange,
  showPasswordValidation = false 
}) => {
  const [charCount, setCharCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasMaxLength: true,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    if (maxLength) {
      setCharCount(0);
    }
  }, [maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (maxLength) {
      setCharCount(e.target.value.length);
      if (e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
        setCharCount(maxLength);
      }
    }
  
    if (type === "password") {
      const password = e.target.value;
      setPasswordValidation({
        hasMinLength: password.length >= 6,
        hasMaxLength: password.length <= 18,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),]/.test(password)
      });
    }
  
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(e.target.value);
      if (!isValidEmail && e.target.value !== '') {
        errors[id] = {
          type: 'manual',
          message: 'Please enter a valid email address'
        };
      }
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full relative">
      {formatPrice && (
        <BiDollar size={24} className="text-neutral-700 absolute top-5 left-2" />
      )}
       <div className="relative">
        {id === 'bio' ? (
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
            className={`
              peer
              w-full
              p-3
              pt-6 
              border-neutral-500
              bg-slate-50
              border
              rounded-md
              outline-none
              transition
              resize-none
              h-[200px]
              disabled:opacity-70
              disabled:cursor-not-allowed
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
              ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
            `}
            onChange={handleChange}
          />
        ) : (
          <input
            id={id}
            disabled={disabled}
            {...register(id, { 
              required,
              maxLength: maxLength ? {
                value: maxLength,
                message: `Maximum ${maxLength} characters allowed`
              } : undefined,
              validate: type === "password" ? {
                hasRequirements: (value) => {
                  const validation = {
                    hasMinLength: value.length >= 6,
                    hasMaxLength: value.length <= 18,
                    hasUpperCase: /[A-Z]/.test(value),
                    hasLowerCase: /[a-z]/.test(value),
                    hasNumber: /[0-9]/.test(value),
                    hasSpecialChar: /[!@#$%^&*(),]/.test(value)
                  };
                  return Object.values(validation).every(Boolean) || "Password does not meet requirements";
                }
              } : undefined
            })}
            placeholder={placeholder} 
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            className={`
              peer
              w-full
              p-3
              pt-6 
              border-neutral-500
              bg-slate-50
              border
              rounded-md
              outline-none
              transition
              disabled:opacity-70
              disabled:cursor-not-allowed
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${type === "password" ? 'pr-12' : 'pr-4'}
              ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
              ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
            `}
            onChange={handleChange}
          />
        )}
{type === "password" && (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    }}
    className="absolute right-6 top-[20px] text-neutral-600 hover:text-neutral-800 transition-colors"
  >
    {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
  </button>
)}
        <label 
          className={`
            absolute 
            text-sm
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
      {type === "password" && showPasswordValidation && (
        <div className="mt-4 -mb-6 p-3 py-6 bg-slate-50 rounded-lg border border-neutral-200">
          <div className="grid grid-cols-2 gap-3">
            <div className={`
              flex items-center gap-2 transition-colors duration-200
              ${passwordValidation.hasMinLength && passwordValidation.hasMaxLength 
                ? 'text-green-500' 
                : 'text-neutral-500'
              }
            `}>
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${passwordValidation.hasMinLength && passwordValidation.hasMaxLength 
                  ? 'bg-green-500' 
                  : 'bg-neutral-300'
                }
              `}/>
              <span className="text-xs">6-18 characters</span>
            </div>

            <div className={`
              flex items-center gap-2 transition-colors duration-200
              ${passwordValidation.hasUpperCase 
                ? 'text-green-500' 
                : 'text-neutral-500'
              }
            `}>
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${passwordValidation.hasUpperCase 
                  ? 'bg-green-500' 
                  : 'bg-neutral-300'
                }
              `}/>
              <span className="text-xs">Uppercase letter</span>
            </div>

            <div className={`
              flex items-center gap-2 transition-colors duration-200
              ${passwordValidation.hasLowerCase 
                ? 'text-green-500' 
                : 'text-neutral-500'
              }
            `}>
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${passwordValidation.hasLowerCase 
                  ? 'bg-green-500' 
                  : 'bg-neutral-300'
                }
              `}/>
              <span className="text-xs">Lowercase letter</span>
            </div>

            <div className={`
              flex items-center gap-2 transition-colors duration-200
              ${passwordValidation.hasNumber 
                ? 'text-green-500' 
                : 'text-neutral-500'
              }
            `}>
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${passwordValidation.hasNumber 
                  ? 'bg-green-500' 
                  : 'bg-neutral-300'
                }
              `}/>
              <span className="text-xs">Number</span>
            </div>

            <div className={`
              flex items-center gap-2 transition-colors duration-200 col-span-2
              ${passwordValidation.hasSpecialChar 
                ? 'text-green-500' 
                : 'text-neutral-500'
              }
            `}>
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${passwordValidation.hasSpecialChar 
                  ? 'bg-green-500' 
                  : 'bg-neutral-300'
                }
              `}/>
              <span className="text-xs">Special character (!@#$%^&*())</span>
            </div>
          </div>
        </div>
      )}
      {type === "email" && errors[id] && (
        <span className="text-rose-500 text-xs mt-1">
          Please enter a valid email address
        </span>
      )}
    </div>
  );
}
 
export default Input;