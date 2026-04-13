'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WalkthroughStep } from '@/app/hooks/useWalkthrough';

interface WalkthroughTooltipProps {
  step: WalkthroughStep;
  currentStep: number;
  totalSteps: number;
  targetRect: DOMRect;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const TOOLTIP_GAP = 16;
const TOOLTIP_WIDTH = 340;
const EDGE_PADDING = 16;

const WalkthroughTooltip: React.FC<WalkthroughTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Clamp a horizontal center so the tooltip stays within the viewport
  const clampX = (centerX: number): number => {
    const halfWidth = TOOLTIP_WIDTH / 2;
    const minLeft = EDGE_PADDING;
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - EDGE_PADDING;
    return Math.max(minLeft, Math.min(maxLeft, centerX - halfWidth));
  };

  // Clamp a vertical center so the tooltip stays within the viewport
  const clampY = (centerY: number, tooltipHeight: number): number => {
    const halfHeight = tooltipHeight / 2;
    const minTop = EDGE_PADDING;
    const maxTop = window.innerHeight - tooltipHeight - EDGE_PADDING;
    return Math.max(minTop, Math.min(maxTop, centerY - halfHeight));
  };

  // Calculate position based on placement, clamped to viewport
  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
      width: TOOLTIP_WIDTH,
    };

    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    // Estimate tooltip height for vertical clamping
    const estimatedHeight = 200;

    switch (step.placement) {
      case 'bottom':
        if (step.overlap) {
          // Position inside the spotlight, anchored near the bottom
          style.bottom = window.innerHeight - targetRect.bottom + TOOLTIP_GAP;
          style.left = clampX(centerX);
        } else {
          style.top = targetRect.bottom + TOOLTIP_GAP;
          style.left = clampX(centerX);
        }
        break;
      case 'top':
        style.bottom = window.innerHeight - targetRect.top + TOOLTIP_GAP;
        style.left = clampX(centerX);
        break;
      case 'left': {
        const leftPos = targetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
        if (leftPos < EDGE_PADDING) {
          // Not enough room on left — place below instead
          style.top = targetRect.bottom + TOOLTIP_GAP;
          style.left = clampX(centerX);
        } else {
          style.top = clampY(centerY, estimatedHeight);
          style.left = leftPos;
        }
        break;
      }
      case 'right': {
        const rightPos = targetRect.right + TOOLTIP_GAP;
        if (rightPos + TOOLTIP_WIDTH > window.innerWidth - EDGE_PADDING) {
          // Not enough room on right — place below instead
          style.top = targetRect.bottom + TOOLTIP_GAP;
          style.left = clampX(centerX);
        } else {
          style.top = clampY(centerY, estimatedHeight);
          style.left = rightPos;
        }
        break;
      }
    }

    return style;
  };

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={getStyle()}
    >
      <div className="bg-white dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-700/60 rounded-2xl shadow-2xl shadow-gray-900/20 p-5 backdrop-blur-xl">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-[12px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>
        </div>

        {/* Content */}
        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-1.5">
          {step.title}
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-medium bg-transparent border border-gray-200 dark:border-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98]"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WalkthroughTooltip;
