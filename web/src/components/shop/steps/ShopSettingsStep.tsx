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
              ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
          }`}
        >
          <div>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Enable shop</span>
            <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-0.5">Make your shop visible to customers</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center ${
            shopEnabled ? 'bg-stone-900 justify-end' : 'bg-stone-300 justify-start'
          }`}>
            <div className="w-5 h-5 bg-white dark:bg-stone-900 rounded-full shadow mx-0.5" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
