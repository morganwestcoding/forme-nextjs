'use client';

import { useEffect } from 'react';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRegisterModal from '@/app/hooks/useRegisterModal';

interface UseAuthTriggerProps {
  requireAuth?: boolean;
  showRegisterInstead?: boolean;
}

export const useAuthTrigger = ({ 
  requireAuth = false, 
  showRegisterInstead = false 
}: UseAuthTriggerProps = {}) => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  useEffect(() => {
    if (!requireAuth) return;

    // Small delay to allow page to render first, then show modal with animation
    const timer = setTimeout(() => {
      if (showRegisterInstead) {
        if (!registerModal.isOpen && !loginModal.isOpen) {
          registerModal.onOpen();
        }
      } else {
        if (!loginModal.isOpen && !registerModal.isOpen) {
          loginModal.onOpen();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [requireAuth, showRegisterInstead, loginModal, registerModal]);

  return {
    openLogin: loginModal.onOpen,
    openRegister: registerModal.onOpen,
    loginModal,
    registerModal
  };
};