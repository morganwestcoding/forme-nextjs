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
          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          : outline
            ? 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            : 'bg-[#60A5FA] text-white hover:bg-[#3b82f6] border border-[#60A5FA] hover:border-[#3b82f6] shadow-lg shadow-[#60A5FA]/25 hover:shadow-xl hover:shadow-[#60A5FA]/30'
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