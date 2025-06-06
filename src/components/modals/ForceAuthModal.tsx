'use client';

import { useEffect } from 'react';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRegisterModal from '@/app/hooks/useRegisterModal';

interface ForceAuthModalProps {
  showRegisterInstead?: boolean;
}

const ForceAuthModal: React.FC<ForceAuthModalProps> = ({ showRegisterInstead = false }) => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  useEffect(() => {
    if (showRegisterInstead) {
      if (!registerModal.isOpen) {
        registerModal.onOpen();
      }
    } else {
      if (!loginModal.isOpen) {
        loginModal.onOpen();
      }
    }
  }, [showRegisterInstead, loginModal, registerModal]);

  return null;
};

export default ForceAuthModal;
