import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 touch-manipulation';

    const variantClasses = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg active:bg-primary-900 transition-all duration-250 ease-out',
      secondary:
        'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50 hover:border-primary-700 hover:text-primary-700 focus:ring-primary-500 transition-all duration-250 ease-out',
      outline:
        'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus:ring-neutral-400 transition-all duration-250 ease-out',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-300 active:bg-neutral-200 transition-all duration-250 ease-out',
      danger:
        'bg-semantic-error text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-md hover:shadow-lg transition-all duration-250 ease-out',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-small min-h-[44px]', // Touch target minimum WCAG
      md: 'px-6 py-3 text-body min-h-[48px]',  // Design system spacing
      lg: 'px-8 py-4 text-h5 min-h-[56px]',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    return (
      <button ref={ref} disabled={disabled || loading} className={classes} {...props}>
        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
