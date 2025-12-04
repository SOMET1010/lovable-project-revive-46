/**
 * InputWithIcon - Reusable input component with left icon
 * Supports multiple style variants and password visibility toggle
 */

import { forwardRef, useState, InputHTMLAttributes } from 'react';
import { LucideIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface InputWithIconProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Left icon component */
  icon: LucideIcon;
  /** Label text above input */
  label?: string;
  /** Style variant */
  variant?: 'default' | 'modern' | 'cyan';
  /** Enable password mode with visibility toggle */
  isPassword?: boolean;
  /** Show/hide password toggle button */
  showPasswordToggle?: boolean;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Custom icon color (overrides variant) */
  iconColor?: string;
  /** Container className */
  containerClassName?: string;
  /** Helper text below input */
  helperText?: string;
}

const variantStyles = {
  default: {
    border: 'border border-[var(--color-neutral-200)]',
    focus: 'focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]',
    icon: 'text-[var(--color-neutral-400)]',
    label: 'text-[var(--color-neutral-700)]',
    bg: 'bg-white',
  },
  modern: {
    border: 'border-2 border-gray-200',
    focus: 'focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100',
    icon: 'text-gray-400',
    label: 'text-gray-700',
    bg: 'bg-white',
  },
  cyan: {
    border: 'border-2 border-gray-200',
    focus: 'focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500',
    icon: 'text-cyan-500',
    label: 'text-gray-700',
    bg: 'bg-white/70',
  },
};

const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  (
    {
      icon: Icon,
      label,
      variant = 'default',
      isPassword = false,
      showPasswordToggle = true,
      error,
      success,
      iconColor,
      containerClassName,
      helperText,
      className,
      type,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine actual input type
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const styles = variantStyles[variant];

    return (
      <div className={containerClassName}>
        {label && (
          <label
            className={cn(
              'block text-sm font-semibold mb-2',
              styles.label
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {/* Left Icon */}
          <Icon
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10',
              iconColor || styles.icon
            )}
          />

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full py-3 rounded-xl transition-all outline-none',
              styles.bg,
              styles.border,
              styles.focus,
              isPassword && showPasswordToggle ? 'pr-12' : 'pr-4',
              error && 'border-red-500 focus:ring-red-200 focus:border-red-500',
              success && 'border-green-500 focus:ring-green-200 focus:border-green-500',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
              className
            )}
            style={{ paddingLeft: '44px' }}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';

export default InputWithIcon;
