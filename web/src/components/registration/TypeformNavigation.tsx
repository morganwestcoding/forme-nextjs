'use client';

import { useRouter } from 'next/navigation';
import { Cancel01Icon, ArrowLeft01Icon as ArrowLeft } from 'hugeicons-react';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

interface TypeformNavigationProps {
  canProceed: boolean;
  showBack: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  submitLabel?: string;
  onExit?: () => void;
  termsNotice?: boolean;
  // In edit mode the bottom CTA always reads "Save changes" and triggers
  // onSave on every step, not just the last one. Linear navigation is
  // handled by the EditStepJumper pill bar at the top instead.
  isEditMode?: boolean;
  onSave?: () => void;
}

export default function TypeformNavigation({
  canProceed,
  showBack,
  isLastStep,
  isLoading,
  onNext,
  onBack,
  submitLabel = 'Create account',
  onExit,
  termsNotice,
  isEditMode,
  onSave,
}: TypeformNavigationProps) {
  const router = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      router.back();
    }
  };

  return (
    <>
      {/* Exit button — top right */}
      <IconButton
        aria-label="Exit"
        onClick={handleExit}
        size="lg"
        icon={<Cancel01Icon className="w-5 h-5" strokeWidth={1.5} />}
        className="fixed top-6 right-6 z-50 rounded-full"
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 px-6 py-4">
        {termsNotice && isLastStep && (
          <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 mb-2 max-w-xl mx-auto">
            By continuing, you agree to the ForMe{' '}
            <a href="/terms" target="_blank" className="underline hover:text-stone-600 dark:text-stone-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" className="underline hover:text-stone-600 dark:text-stone-300">Privacy Policy</a>.
          </p>
        )}
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <div>
            {showBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
            )}
          </div>

          {/* Continue / Save button + hint */}
          <div className="flex items-center gap-4">
            {!isEditMode && (
              <span className="text-sm text-stone-400 dark:text-stone-500 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-xs font-mono">Enter</kbd>
              </span>
            )}
            <Button
              type="button"
              onClick={isEditMode ? (onSave ?? onNext) : onNext}
              disabled={!canProceed}
              loading={isLoading}
              size="md"
            >
              {isEditMode ? 'Save changes' : isLastStep ? submitLabel : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
