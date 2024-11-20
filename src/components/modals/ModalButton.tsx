'use client';

import { IconType } from "react-icons";

interface ModalButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
}

const ModalButton: React.FC<ModalButtonProps> = ({ 
  label, 
  onClick, 
  disabled, 
  outline,
  small,
  icon: Icon,

}) => {
  return ( 
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        
        disabled:cursor-not-allowed
        rounded-lg
        shadow
        border-transparent
       
        transition
        w-full
        ${outline ? 'bg-white' : 'bg-[#78C3FB]'}
        ${outline ? 'border-white' : 'bg-[#78C3FB]'}
        ${outline ? 'text-black' : 'text-white'}
        ${small ? 'text-sm' : 'text-md'}
        ${small ? 'py-1' : 'py-3'}
        ${small ? 'font-light' : 'font-light'}
        ${small ? 'border-[1px]' : 'border-[1px]'}
      `}>
        {Icon && (
        <Icon
          size={24}
          className="
            absolute
            left-4
            top-3
            
          "
        />
        )}
      {label}
    </button>
   );
}
 
export default ModalButton;