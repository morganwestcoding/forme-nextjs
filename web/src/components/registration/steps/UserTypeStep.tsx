'use client';

import { motion } from 'framer-motion';

import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';
import { ShoppingBag02Icon, UserIcon as User, UserMultipleIcon as Users } from 'hugeicons-react';
import { GraduationCap } from 'lucide-react';

interface UserTypeStepProps {
  userType: string;
  onUserTypeChange: (type: 'customer' | 'individual' | 'team' | 'student') => void;
}

const options = [
  {
    value: 'customer' as const,
    icon: ShoppingBag02Icon,
    title: 'Customer',
    description: 'I want to discover and book services',
  },
  {
    value: 'individual' as const,
    icon: User,
    title: 'Independent provider',
    description: 'I offer services on my own',
  },
  {
    value: 'team' as const,
    icon: Users,
    title: 'Team member',
    description: "I'm part of an existing business",
  },
  {
    value: 'student' as const,
    icon: GraduationCap,
    title: 'Student',
    description: "I'm enrolled at a partner academy",
  },
];

export default function UserTypeStep({ userType, onUserTypeChange }: UserTypeStepProps) {
  return (
    <div>
      <TypeformHeading
        question="How will you use ForMe?"
        subtitle="This helps us set up the right experience for you"
      />

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = userType === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onUserTypeChange(option.value)}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              className={`
                flex flex-col items-center text-center gap-3 p-5 rounded-xl border transition-colors duration-200
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                ${isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{option.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-0.5">{option.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.p variants={itemVariants} className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
        Select an option to continue
      </motion.p>
    </div>
  );
}
