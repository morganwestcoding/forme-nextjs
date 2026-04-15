'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import Modal from './Modal';
import useUpgradeModal from '@/app/hooks/useUpgradeModal';
import { LockIcon as Lock } from 'hugeicons-react';

const UpgradeModal: React.FC = () => {
  const router = useRouter();
  const upgradeModal = useUpgradeModal();

  const body = (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
        <Lock className="w-7 h-7 text-stone-400 dark:text-stone-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Upgrade to Unlock {upgradeModal.feature}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-1.5 max-w-sm">
          {upgradeModal.feature} is available on the {upgradeModal.requiredTier} plan
          and above. Upgrade your subscription to access this feature.
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={upgradeModal.isOpen}
      onClose={upgradeModal.onClose}
      onSubmit={() => {
        upgradeModal.onClose();
        router.push('/subscription');
      }}
      title="Upgrade Required"
      body={body}
      actionLabel="View Plans"
      secondaryAction={upgradeModal.onClose}
      secondaryActionLabel="Maybe Later"
      className="w-full md:w-[440px] lg:w-[440px] xl:w-[440px]"
    />
  );
};

export default UpgradeModal;
