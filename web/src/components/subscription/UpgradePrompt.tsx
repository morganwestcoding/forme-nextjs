'use client';

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

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
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Upgrade to Unlock {feature}
      </h2>
      <p className="text-gray-500 max-w-md">
        {feature} is available on the {requiredTier} plan and above.
        Upgrade your subscription to access this feature.
      </p>
      <button
        onClick={() => router.push('/subscription')}
        className="mt-4 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        View Plans
      </button>
    </div>
  );
};

export default UpgradePrompt;
