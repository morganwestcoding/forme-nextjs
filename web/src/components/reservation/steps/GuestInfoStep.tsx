'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface GuestInfoStepProps {
  guestInfo: GuestInfo;
  onChange: (next: GuestInfo) => void;
}

const inputClass =
  'w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150';

export default function GuestInfoStep({ guestInfo, onChange }: GuestInfoStepProps) {
  const set = (key: keyof GuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...guestInfo, [key]: e.target.value });

  return (
    <div>
      <TypeformHeading
        question="Your details"
        subtitle="So the professional can confirm your booking"
      />

      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Full name
          </label>
          <input
            id="guestName"
            type="text"
            autoComplete="name"
            autoFocus
            value={guestInfo.name}
            onChange={set('name')}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="guestEmail" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Email
          </label>
          <input
            id="guestEmail"
            type="email"
            autoComplete="email"
            value={guestInfo.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
            Your booking confirmation goes here.
          </p>
        </div>

        <div>
          <label htmlFor="guestPhone" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Phone <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
          </label>
          <input
            id="guestPhone"
            type="tel"
            autoComplete="tel"
            value={guestInfo.phone}
            onChange={set('phone')}
            placeholder="(555) 123-4567"
            className={inputClass}
          />
        </div>
      </motion.div>
    </div>
  );
}
