import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-semibold font-regular',
      'rounded-base',
      'transition-fast ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-manipulation',
      // Accessibilité WCAG AA - target tactile minimum
      'min-h-[var(--size-touch-target-min)]'
    ].join(' ');

    const variantClasses = {
      primary: [
        'bg-primary-500',
        'text-white',
        'hover:bg-primary-700',
        'active:bg-primary-900',
        'focus:ring-primary-500',
        'shadow-md',
        'hover:shadow-lg',
        'hover:scale-102', // Utilise transform pour l'effet hover
      ].join(' '),
      
      secondary: [
        'bg-transparent',
        'border-2',
        'border-primary-500',
        'text-primary-500',
        'hover:bg-primary-50',
        'hover:border-primary-700',
        'hover:text-primary-700',
        'active:bg-primary-100',
        'focus:ring-primary-500',
      ].join(' '),
      
      outline: [
        'border-2',
        'border-neutral-100',
        'text-neutral-700',
        'hover:bg-neutral-50',
        'hover:border-neutral-300',
        'hover:text-neutral-900',
        'focus:ring-neutral-500',
      ].join(' '),
      
      ghost: [
        'text-neutral-700',
        'hover:bg-neutral-100',
        'hover:text-neutral-900',
        'focus:ring-neutral-300',
        'active:bg-neutral-200',
      ].join(' '),
      
      danger: [
        'bg-semantic-error',
        'text-white',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus:ring-red-500',
        'shadow-md',
        'hover:shadow-lg',
      ].join(' '),
    };

    const sizeClasses = {
      small: [
        'px-4 py-2',
        'text-small',
        'min-h-[44px]', // WCAG AA minimum touch target
      ].join(' '),
      
      medium: [
        'px-6 py-3',
        'text-body',
        'min-h-[48px]', // Design system standard
      ].join(' '),
      
      large: [
        'px-8 py-4',
        'text-h5',
        'min-h-[56px]', // Large buttons for primary CTAs
      ].join(' '),
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = loading ? 'cursor-wait' : '';

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      loadingClass,
      className
    ].filter(Boolean).join(' ');

    return (
      <button 
        ref={ref} 
        disabled={disabled || loading} 
        className={classes}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
