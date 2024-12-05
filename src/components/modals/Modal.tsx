'use client';

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import ModalButton from "./ModalButton";

interface ModalProps {
  id?: string;  
  modalContentId?: string;  // Add this prop
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
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
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
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
        <div className={`relative ${className || 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'} my-6 mx-auto h-full lg:h-auto md:h-auto`}>
          <div className={`translate duration-300 h-full ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'}`}>
            <div id={id} className="translate h-full lg:h-auto md:h-auto border-0 rounded-2xl relative flex flex-col w-full bg-black bg-opacity-55 backdrop-blur-md outline-none focus:outline-none">
              <div className="flex items-center p-6 rounded-t justify-center relative border-b-[1px]">
                <div 
                  id="modal-close"
                  className="p-1 border-0 hover:opacity-70 transition absolute right-9" 
                  onClick={handleClose}
                >
                  <X size={18} className="text-white"/>
                </div>
                <div className="text-lg text-white font-medium">
                  {title}
                </div>
              </div>
              <div id={modalContentId} className="flex flex-col flex-1">
                <div className="relative p-6 text-white flex-auto">
                  {body}
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
    </>
  );
}

export default Modal;