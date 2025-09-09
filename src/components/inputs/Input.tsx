'use client';

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiDollar } from "react-icons/bi";
import { useState, useEffect, ChangeEvent } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps {
  id: string;
  label?: string;  
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  maxLength?: number;
  showPasswordValidation?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;        
  inputClassName?: string;   
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
  placeholder = " ", // Changed from "" to " " for floating labels
  disabled, 
  formatPrice,
  register,
  required,
  errors,
  maxLength,
  onChange,
  showPasswordValidation = false,
  className,
  inputClassName
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
    if (maxLength) setCharCount(0);
  }, [maxLength]);

  // Helper function to safely extract error message as string
  const getErrorMessage = (): string => {
    const error = errors[id];
    if (!error) return '';
    
    // Handle different error types from React Hook Form
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message;
      if (typeof message === 'string') return message;
    }
    
    // Fallback message
    return `Please check your ${label || id}`;
  };

  // FIXED: Better change handler that properly handles maxLength
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Handle maxLength by truncating if necessary
    if (maxLength && value.length > maxLength) {
      const truncatedValue = value.slice(0, maxLength);
      e.target.value = truncatedValue;
      setCharCount(maxLength);
    } else {
      setCharCount(value.length);
    }

    // Password validation
    if (type === "password") {
      setPasswordValidation({
        hasMinLength: value.length >= 6,
        hasMaxLength: value.length <= 18,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),]/.test(value)
      });
    }

    // Call external onChange if provided
    onChange?.(e);
  };

  // Better validation rules
  const getValidationRules = () => {
    const rules: any = {};

    if (required) {
      rules.required = "This field is required";
    }

    if (maxLength) {
      rules.maxLength = {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`
      };
    }

    // Type-specific validations
    if (type === "email") {
      rules.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address"
      };
    }

    if (type === "password" && showPasswordValidation) {
      rules.validate = {
        hasRequirements: (value: string) => {
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
      };
    }

    // Allow spaces in name field
    if (id === "name") {
      rules.pattern = {
        value: /^[a-zA-Z\s'.-]+$/, // Allow letters, spaces, apostrophes, periods, hyphens
        message: "Name can only contain letters, spaces, and common punctuation"
      };
      rules.minLength = {
        value: 1,
        message: "Please enter your name"
      };
    }

    return rules;
  };

  return (
    <div className={`w-full relative ${className ?? ''}`}>
      {formatPrice && (
        <BiDollar size={24} className="text-neutral-700 absolute top-5 left-2 z-10" />
      )}

      <div className="relative">
        {id === 'bio' ? (
          <textarea
            id={id}
            disabled={disabled}
            {...register(id, getValidationRules())}
            placeholder={placeholder}
            className={`
              peer w-full p-3 pt-6 border-neutral-300 bg-neutral-50 border rounded-lg
              outline-none transition resize-none h-[200px]
              disabled:opacity-70 disabled:cursor-not-allowed
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
              ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
              ${inputClassName ?? ''}
            `}
            onChange={handleChange}
          />
        ) : (
          <input
            id={id}
            disabled={disabled}
            {...register(id, getValidationRules())}
            placeholder={placeholder} 
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            // Add proper autocomplete attributes
            autoComplete={
              id === "name" ? "name" :
              id === "email" ? "email" :
              id === "password" ? "current-password" :
              "off"
            }
            spellCheck={id === "name" || id === "bio"}
            className={`
              peer w-full p-3 pt-6 bg-neutral-50 border-neutral-300 border rounded-lg
              outline-none transition disabled:opacity-70 disabled:cursor-not-allowed
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${type === "password" ? 'pr-12' : 'pr-4'}
              ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
              ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
              ${inputClassName ?? ''}
            `}
            onChange={handleChange}
            // REMOVED: onKeyDown handler - let onChange handle maxLength instead
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
            className="absolute right-6 top-[20px] text-neutral-500 hover:text-neutral-800 transition-colors z-10"
            tabIndex={-1} // Prevent tab focus on this button
          >
            {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
          </button>
        )}

        {label && (
          <label 
            htmlFor={id}
            className={`
              absolute text-sm duration-150 transform -translate-y-3 top-5 origin-[0] pointer-events-none
              ${formatPrice ? 'left-9' : 'left-4'}
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
              peer-focus:scale-75 peer-focus:-translate-y-4
              ${errors[id] ? 'text-rose-500' : 'text-neutral-500'}
            `}
          >
            {label}
          </label>
        )}
      </div>

      {maxLength && (
        <span className="absolute -top-6 right-4 text-xs text-gray-500">
          {charCount}/{maxLength}
        </span>
      )}

      {/* Error display with proper string handling */}
      {errors[id] && (
        <span className="text-rose-500 text-xs mt-1 block">
          {getErrorMessage()}
        </span>
      )}

      {type === "password" && showPasswordValidation && (
        <div className="mt-4 -mb-6 p-3 py-6 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`} />
              At least 6 characters
            </div>
            <div className={`flex items-center gap-2 ${passwordValidation.hasMaxLength ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasMaxLength ? 'bg-green-500' : 'bg-gray-300'}`} />
              Max 18 characters
            </div>
            <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
              One uppercase letter
            </div>
            <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
              One lowercase letter
            </div>
            <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
              One number
            </div>
            <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`} />
              One special character
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Input;