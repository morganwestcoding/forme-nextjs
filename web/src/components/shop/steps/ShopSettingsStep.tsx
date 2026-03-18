'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import { motion } from 'framer-motion';
import { itemVariants } from '@/components/registration/TypeformStep';

interface ShopSettingsStepProps {
  shopEnabled: boolean;
  onShopEnabledChange: (value: boolean) => void;
}

export default function ShopSettingsStep({
  shopEnabled,
  onShopEnabledChange,
}: ShopSettingsStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Shop settings"
        subtitle="Configure your shop preferences"
      />

      <div className="space-y-4">
        <motion.button
          type="button"
          variants={itemVariants}
          onClick={() => onShopEnabledChange(!shopEnabled)}
          className={`w-full p-4 rounded-xl border text-left transition-colors duration-200 flex items-center justify-between ${
            shopEnabled
              ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div>
            <span className="text-sm font-medium text-gray-900">Enable shop</span>
            <p className="text-xs text-gray-500 mt-0.5">Make your shop visible to customers</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
            shopEnabled ? 'bg-gray-900 justify-end' : 'bg-gray-300 justify-start'
          }`}>
            <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
