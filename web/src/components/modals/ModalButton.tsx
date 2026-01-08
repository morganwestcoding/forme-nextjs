'use client';

import { IconType } from "react-icons";

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
  const isEditButton = label.toLowerCase().includes('edit');

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
            ? 'bg-transparent border border-gray-200 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-300'
            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
        }
        ${small ? 'text-sm py-2 px-4' : 'text-sm py-3.5 px-6'}
      `}
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