'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { X } from "lucide-react";
import ModalButton from "./ModalButton";
import ModalBackdrop from "./ModalBackdrop";

export interface ModalHandle {
  close: () => void; // expose animated close
}

interface ModalProps {
  backdropVideo?: string;
  id?: string;
  modalContentId?: string;
  isOpen?: boolean;                 // controlled by store
  onClose: () => void;              // should flip store.isOpen -> false
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

const ANIM_MS = 300;

const Modal = forwardRef<ModalHandle, ModalProps>(({
  id,
  modalContentId,
  isOpen = false,
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
  backdropVideo,
}, ref) => {
  const [showModal, setShowModal] = useState<boolean>(isOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal animation state with external isOpen
  useEffect(() => {
    setShowModal(isOpen);
    if (isOpen) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Close with animation, then flip the store after 300ms
  const handleClose = useCallback(() => {
    if (disabled) return;
    setShowModal(false);
    const t = setTimeout(() => {
      onClose();
    }, ANIM_MS);
    return () => clearTimeout(t);
  }, [onClose, disabled]);

  useImperativeHandle(ref, () => ({ close: handleClose }), [handleClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [secondaryAction, disabled]);

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Only close if click was on the backdrop, not on content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id || "modal"}-title` : undefined}
      className="fixed inset-0 z-[9999] bg-neutral-900/70"
      onMouseDown={handleBackdropClick}
    >
      {backdropVideo && <ModalBackdrop videoSrc={backdropVideo} />}

      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto">
        <div
          className={`relative ${className || "w-full md:w-4/6 lg:w-3/6 xl:w-2/5"} my-2 mx-auto h-full lg:h-auto md:h-auto`}
          // stop backdrop handler when clicking inside content
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Slide + fade */}
          <div
            className={`duration-300 h-full transform transition-all
              ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            <div
              id={id}
              className="h-full lg:h-auto md:h-auto border-0 rounded-xl relative flex flex-col w-full bg-white/95 backdrop-blur-md outline-none"
            >
              {/* Close (X) */}
              <div className="relative w-full">
                <button
                  aria-label="Close"
                  onClick={(e) => { e.stopPropagation(); handleClose(); }}
                  className="absolute right-4 top-4 p-1 hover:opacity-70 transition z-10"
                >
                  <X size={18} className="text-black" />
                </button>
              </div>

              {/* Content */}
              <div id={`${modalContentId || "modal-content"}-wrapper`} className="flex flex-col flex-1">
                {title && (
                  <h2 id={`${id || "modal"}-title`} className="sr-only">
                    {title}
                  </h2>
                )}
                <div id={modalContentId || "modal-content"} className="flex flex-col flex-1">
                  <div className="relative p-6 text-black flex-auto">
                    {body}
                  </div>
                </div>

                {(actionLabel || secondaryActionLabel || footer) && (
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
});

Modal.displayName = "Modal";
export default Modal;
