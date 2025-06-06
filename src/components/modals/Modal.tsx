'use client';

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import ModalButton from "./ModalButton";
import ModalBackdrop from './ModalBackdrop';

interface ModalProps {
  backdropVideo?: string; 
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
  backdropVideo
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }
  
    setShowModal(false);
    
    setTimeout(() => {
      onClose();
    }, 300)
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
        fixed 
        inset-0 
        z-50
        bg-neutral-800/90
      "
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
      }}
    >

{backdropVideo && <ModalBackdrop videoSrc={backdropVideo} />}
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
      >
        <div className={`relative ${className || 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'} my-2 mx-auto h-full lg:h-auto md:h-auto`}>
          <div className={`translate duration-300 h-full ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'}`}>
            <div 
              id={id} 
              className="
                translate 
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
    </div>
  );
}

export default Modal;