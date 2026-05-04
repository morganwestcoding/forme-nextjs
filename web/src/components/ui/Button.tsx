'use client';

import React, { forwardRef } from 'react';
import { Loading03Icon } from 'hugeicons-react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'success-soft'
  | 'danger-soft'
  | 'warning-soft'
  | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 shadow-elevation-1',
  secondary:
    'bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
  outline:
    'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700 dark:hover:bg-stone-800',
  ghost:
    'bg-transparent text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800',
  destructive:
    'bg-danger text-danger-foreground hover:opacity-90 shadow-glow-danger',
  success:
    'bg-success text-success-foreground hover:opacity-90',
  'success-soft':
    'bg-success-soft text-success-soft-foreground hover:opacity-90',
  'danger-soft':
    'bg-danger-soft text-danger-soft-foreground hover:opacity-90',
  'warning-soft':
    'bg-warning-soft text-warning-soft-foreground hover:opacity-90',
  link:
    'bg-transparent text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 shadow-none',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-10 px-4 text-[13px]',
  lg: 'h-12 px-5 text-[14px]',
};

// Gap is applied to the inner content span (not the button itself) so the
// absolutely-positioned loading spinner doesn't get spaced by it.
const GAP_CLASSES: Record<Size, string> = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
};

const ICON_SIZE: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // The link variant is inline-text-shaped and skips height/padding from
    // SIZE_CLASSES — it sizes to its content so it can sit beside body text.
    const isLink = variant === 'link';
    const sizeClass = isLink
      ? size === 'sm' ? 'text-[12px]' : size === 'lg' ? 'text-[14px]' : 'text-[13px]'
      : SIZE_CLASSES[size];
    const shapeClass = isLink ? '' : 'rounded-xl';
    const stateClass = isLink
      ? 'transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
      : 'transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={`
          relative inline-flex items-center justify-center font-medium ${shapeClass}
          ${stateClass}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2
          ${VARIANT_CLASSES[variant]}
          ${sizeClass}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...rest}
      >
        <span
          className={`inline-flex items-center justify-center ${GAP_CLASSES[size]} ${loading ? 'invisible' : ''}`}
        >
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </span>
        {loading && (
          <span className="absolute inset-0 inline-flex items-center justify-center" aria-hidden="true">
            <Loading03Icon size={ICON_SIZE[size]} className="animate-spin" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
