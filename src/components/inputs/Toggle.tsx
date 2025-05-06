'use client';

import { useState, useEffect } from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  enabled,
  onChange,
  disabled = false
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);
  
  const handleToggle = () => {
    if (disabled) return;
    
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onChange(newValue);
  };
  
  return (
    <div className={`flex items-start ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center h-6">
        <button
          type="button"
          className={`
            relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full 
            transition-colors ease-in-out duration-200 focus:outline-none
            ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={handleToggle}
          disabled={disabled}
          aria-pressed={isEnabled}
        >
          <span className="sr-only">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow 
              transform transition ease-in-out duration-200
              ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      <div className="ml-3">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default Toggle;