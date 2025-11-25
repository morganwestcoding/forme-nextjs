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
      className="fixed inset-0 z-[9999] backdrop-blur-sm bg-neutral-900/60 animate-in fade-in duration-300"
      onMouseDown={handleBackdropClick}
    >
      {backdropVideo && <ModalBackdrop videoSrc={backdropVideo} />}

      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div
          className={`relative ${className || "w-full md:w-4/6 lg:w-3/6 xl:w-2/5"} mx-auto`}
          // stop backdrop handler when clicking inside content
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Slide + fade */}
          <div
            className={`transform transition-all duration-300 ease-out
              ${showModal ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}`}
          >
            <div
              id={id}
              className="relative flex flex-col w-full bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl shadow-gray-900/20 overflow-hidden"
            >
              {/* Close (X) */}
              <button
                aria-label="Close"
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="absolute right-5 top-5 p-2 rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200 z-10 group"
              >
                <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
              </button>

              {/* Content */}
              <div id={`${modalContentId || "modal-content"}-wrapper`} className="flex flex-col">
                {title && (
                  <h2 id={`${id || "modal"}-title`} className="sr-only">
                    {title}
                  </h2>
                )}
                <div id={modalContentId || "modal-content"} className="flex flex-col">
                  <div className="relative px-8 pt-8 pb-6 text-gray-800">
                    {body}
                  </div>
                </div>

                {(actionLabel || secondaryActionLabel || footer) && (
                  <div className="flex flex-col gap-3 px-8 pb-8 pt-2">
                    <div className="flex flex-row items-center gap-3 w-full">
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
