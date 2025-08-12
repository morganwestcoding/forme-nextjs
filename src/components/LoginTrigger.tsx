'use client';

import { useEffect } from 'react';
import useLoginModal from '@/app/hooks/useLoginModal';

const LoginTrigger = () => {
  const loginModal = useLoginModal();
  
  useEffect(() => {
    // Small delay to allow page to render first
    const timer = setTimeout(() => {
      if (!loginModal.isOpen) {
        loginModal.onOpen();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loginModal]);
  
  return null;
};

export default LoginTrigger;