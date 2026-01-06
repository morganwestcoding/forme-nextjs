'use client';

import { ArrowLeft } from 'lucide-react';

interface TypeformNavigationProps {
  canProceed: boolean;
  showBack: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  submitLabel?: string;
}

export default function TypeformNavigation({
  canProceed,
  showBack,
  isLastStep,
  isLoading,
  onNext,
  onBack,
  submitLabel = 'Create account',
}: TypeformNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Back button */}
        <div>
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
        </div>

        {/* Continue button + hint */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd>
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${canProceed && !isLoading
                ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLastStep ? (
              submitLabel
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
