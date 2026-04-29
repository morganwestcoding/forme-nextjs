'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loading03Icon } from 'hugeicons-react';
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

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <Loading03Icon size={28} className="animate-spin text-stone-400 dark:text-stone-500 mb-3" />
      <p className="text-[13px] text-stone-500 dark:text-stone-400">Opening password reset…</p>
    </div>
  );
};

export default ResetPasswordPage;