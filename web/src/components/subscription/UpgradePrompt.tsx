'use client';

import { useRouter } from "next/navigation";
import { LockIcon as Lock } from 'hugeicons-react';

interface UpgradePromptProps {
  feature: string;
  requiredTier?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier = "Gold",
}) => {
  const router = useRouter();

  return (
    <div className="h-[60vh] flex flex-col gap-4 justify-center items-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
        <Lock className="w-8 h-8 text-stone-400" />
      </div>
      <h2 className="text-2xl font-bold text-stone-900">
        Upgrade to Unlock {feature}
      </h2>
      <p className="text-stone-500 max-w-md">
        {feature} is available on the {requiredTier} plan and above.
        Upgrade your subscription to access this feature.
      </p>
      <button
        onClick={() => router.push('/subscription')}
        className="mt-4 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-stone-800 transition"
      >
        View Plans
      </button>
    </div>
  );
};

export default UpgradePrompt;
