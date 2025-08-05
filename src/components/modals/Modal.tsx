'use client';

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import ModalButton from "./ModalButton";

interface ModalProps {
  id?: string;  
  modalContentId?: string;  
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel?: string;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;  
  actionId?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  id,
  modalContentId,
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  body, 
  actionLabel,
  footer, 
  disabled,
  secondaryAction,
  secondaryActionLabel,
  className, 
  actionId,
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Always start from hidden state
      setShowModal(false);
      // Force a reflow to ensure the initial state is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowModal(true);
        });
      });
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }
  
    setShowModal(false);
    
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose, disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }

    onSubmit();
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) {
      return;
    }

    secondaryAction();
  }, [secondaryAction, disabled]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="
        justify-center 
        items-center 
        flex 
        overflow-x-hidden 
        overflow-y-auto 
        fixed 
        inset-0
        outline-none 
        focus:outline-none 
      "
      style={{
        zIndex: 10000, // Higher than backdrop
      }}
    >
      <div className={`relative ${className || 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'} my-2 mx-auto h-full lg:h-auto md:h-auto`}>
        <div 
          className={`
            transform 
            transition-all 
            duration-300 
            ease-in-out 
            h-full 
            ${isOpen && showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          `}
        >
          <div 
            id={id} 
            className="
              h-full 
              lg:h-auto 
              md:h-auto 
              border-0 
              rounded-3xl 
              relative 
              flex 
              flex-col 
              w-full 
              bg-white
              backdrop-blur-md 
              outline-none 
              focus:outline-none
              shadow-lg
            "
          >
            <div className="relative w-full">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute right-4 top-4 p-1 hover:opacity-70 transition z-10"
              >
                <X size={18} className="text-black" />
              </button>
            </div>

            <div id={`${modalContentId}-wrapper`} className="flex flex-col flex-1">
              <div id={modalContentId} className="flex flex-col flex-1">
                <div className="relative p-6 text-black flex-auto">
                  {body}
                </div>
              </div>
              {(actionLabel || secondaryActionLabel) && (
                <div className="flex flex-col gap-2 p-6">
                  <div className="flex flex-row items-center gap-4 w-full">
                    {secondaryAction && secondaryActionLabel && (
                      <ModalButton
                        id="secondary-action-button"
                        outline
                        label={secondaryActionLabel}
                        disabled={disabled} 
                        onClick={handleSecondaryAction}
                      />  
                    )}
                    {actionLabel && (
                      <ModalButton
                        id={actionId || "primary-action-button"}
                        label={actionLabel}
                        disabled={disabled} 
                        onClick={handleSubmit}
                      />
                    )}
                  </div>
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;