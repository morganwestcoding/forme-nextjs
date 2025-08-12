'use client';

import { useEffect, useRef } from 'react';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useForgotPasswordModal from '@/app/hooks/useForgotPasswordModal';

const ModalManager = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const forgotPasswordModal = useForgotPasswordModal();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Check if any AUTH modal is open
  const isAuthModalOpen = loginModal.isOpen || registerModal.isOpen || forgotPasswordModal.isOpen;
  
  useEffect(() => {
    // Prevent body scrolling when auth modals are open
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (videoRef.current && isAuthModalOpen) {
      videoRef.current.playbackRate = 1.0;
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) {
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
      {/* Backdrop video */}
      <div className="fixed inset-0 z-1">
        <video
          ref={videoRef}
          className="absolute inset-0 object-cover w-full h-full filter"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/modal-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0" />
      </div>
    </div>
  );
};

export default ModalManager;