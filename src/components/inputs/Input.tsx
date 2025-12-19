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
  placeholder = " ",
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
  const [showPasswordHelp, setShowPasswordHelp] = useState(false); // NEW: Controls help visibility
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasMaxLength: false, // FIXED: Start as false, not true
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    if (maxLength) setCharCount(0);
  }, [maxLength]);

  const getErrorMessage = (): string => {
    const error = errors[id];
    if (!error) return '';
    
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message;
      if (typeof message === 'string') return message;
    }
    
    return `Please check your ${label || id}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (maxLength && value.length > maxLength) {
      const truncatedValue = value.slice(0, maxLength);
      e.target.value = truncatedValue;
      setCharCount(maxLength);
    } else {
      setCharCount(value.length);
    }

    // FIXED: Password validation logic
    if (type === "password") {
      setPasswordValidation({
        hasMinLength: value.length >= 6,
        hasMaxLength: value.length > 0 && value.length <= 18, // Only true if there's input AND it's <= 18
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),]/.test(value)
      });
    }

    onChange?.(e);
  };

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
            hasMaxLength: value.length > 0 && value.length <= 18,
            hasUpperCase: /[A-Z]/.test(value),
            hasLowerCase: /[a-z]/.test(value),
            hasNumber: /[0-9]/.test(value),
            hasSpecialChar: /[!@#$%^&*(),]/.test(value)
          };
          return Object.values(validation).every(Boolean) || "Password does not meet requirements";
        }
      };
    }

    if (id === "name") {
      rules.pattern = {
        value: /^[a-zA-Z\s'.-]+$/,
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
        {type === 'textarea' ? (
          <textarea
            id={id}
            disabled={disabled}
            {...register(id, getValidationRules())}
            placeholder={placeholder}
            className={`
              peer w-full p-3 pt-6 bg-white border border-gray-200/60 rounded-xl
              outline-none transition-all duration-200 resize-none h-[200px]
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-gray-300
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${errors[id] ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10' : 'focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color-light)]'}
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
            autoComplete={
              id === "name" ? "name" :
              id === "email" ? "email" :
              id === "password" ? "current-password" :
              "off"
            }
            spellCheck={id === "name" || id === "bio"}
            className={`
              peer w-full p-3 pt-6 bg-white border border-gray-200/60 rounded-xl h-[58px]
              outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-gray-300
              ${formatPrice ? 'pl-9' : 'pl-4'}
              ${type === "password" && showPasswordValidation ? 'pr-24' : type === "password" ? 'pr-12' : 'pr-4'}
              ${errors[id] ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10' : 'focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color-light)]'}
              ${inputClassName ?? ''}
            `}
            onChange={handleChange}
          />
        )}

        {/* Password visibility toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPassword(!showPassword);
            }}
            className="absolute right-4 top-[20px] p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 z-10"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}

        {/* Help icon */}
        {type === "password" && showPasswordValidation && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPasswordHelp(!showPasswordHelp);
            }}
            className="absolute right-12 top-[20px] p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 z-10"
            tabIndex={-1}
            aria-label="Password requirements"
            title="Show password requirements"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
              <path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M12.0001 17H12.009" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        )}

        {label && (
          <label
            htmlFor={id}
            className={`
              absolute text-sm duration-150 transform origin-[0] pointer-events-none
              ${formatPrice ? 'left-9' : 'left-4'}
              ${errors[id]
                ? 'text-rose-500 scale-75 -translate-y-4 top-5'
                : 'text-gray-500 -translate-y-3 top-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4'
              }
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

      {errors[id] && (
        <span className="text-rose-500 text-xs mt-1.5 block font-medium">
          {getErrorMessage()}
        </span>
      )}

      {/* Password help - Only shows when showPasswordHelp is true */}
      {type === "password" && showPasswordValidation && showPasswordHelp && (
        <div className="mt-3 -mb-6 p-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasMinLength ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              At least 6 characters
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasMaxLength ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasMaxLength ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              Max 18 characters
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasUpperCase ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              One uppercase letter
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasLowerCase ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              One lowercase letter
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasNumber ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              One number
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-200 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${passwordValidation.hasSpecialChar ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`} />
              One special character
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Input;