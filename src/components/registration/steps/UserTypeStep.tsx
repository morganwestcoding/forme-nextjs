'use client';

import { motion } from 'framer-motion';
import { User, Briefcase, Users } from 'lucide-react';
import TypeformHeading from '../TypeformHeading';

interface UserTypeStepProps {
  userType: string;
  onUserTypeChange: (type: 'customer' | 'individual' | 'team') => void;
}

const options = [
  {
    value: 'customer' as const,
    icon: User,
    title: 'Customer',
    description: 'I want to discover and book services',
  },
  {
    value: 'individual' as const,
    icon: Briefcase,
    title: 'Independent provider',
    description: 'I offer services on my own',
  },
  {
    value: 'team' as const,
    icon: Users,
    title: 'Team member',
    description: 'I work at a business or salon',
  },
];

export default function UserTypeStep({ userType, onUserTypeChange }: UserTypeStepProps) {
  return (
    <div>
      <TypeformHeading
        question="How will you use ForMe?"
        subtitle="This helps us set up the right experience for you"
      />

      <div className="space-y-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          const isSelected = userType === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onUserTypeChange(option.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${isSelected ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-sm text-gray-400 text-center mt-6">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">1</kbd>,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">2</kbd>, or{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">3</kbd> to select
      </p>
    </div>
  );
}
