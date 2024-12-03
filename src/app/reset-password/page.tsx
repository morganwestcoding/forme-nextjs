'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useResetPasswordModal from '@/app/hooks/useResetPasswordModal';

const ResetPasswordPage = () => {
  const router = useRouter();
  const resetPasswordModal = useResetPasswordModal();
  
  const initializeReset = useCallback(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    
    if (token) {
      resetPasswordModal.onOpen(token);
    }
    router.push('/');
  }, [resetPasswordModal, router]);

  useEffect(() => {
    initializeReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ResetPasswordPage;