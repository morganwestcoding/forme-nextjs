'use client';

import { IconType } from "react-icons";
import { useTheme } from "@/app/context/ThemeContext";

interface ModalButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  id?: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  id
}) => {
  const { accentColor } = useTheme();
  const isEditButton = label.toLowerCase().includes('edit');
  const isPrimary = !isEditButton && !outline;

  // Calculate hover color (slightly darker)
  const getHoverColor = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -15;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const hoverColor = getHoverColor(accentColor);

  return (
    <button
      id={id}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        disabled:opacity-50
        disabled:cursor-not-allowed
        rounded-xl
        transition-all
        duration-200
        w-full
        font-medium
        active:scale-[0.98]
        ${isEditButton
          ? 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 hover:border-gray-400'
          : outline
            ? 'bg-transparent border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-400'
            : 'text-white'
        }
        ${small ? 'text-sm py-2 px-4' : 'text-sm py-3.5 px-6'}
      `}
      style={isPrimary ? {
        backgroundColor: accentColor,
        borderColor: accentColor
      } : undefined}
      onMouseEnter={(e) => {
        if (isPrimary && !disabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
          e.currentTarget.style.borderColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary && !disabled) {
          e.currentTarget.style.backgroundColor = accentColor;
          e.currentTarget.style.borderColor = accentColor;
        }
      }}
    >
      {Icon && (
        <Icon
          size={small ? 18 : 20}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        />
      )}
      {label}
    </button>
   );
}

export default ModalButton;