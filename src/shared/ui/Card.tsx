import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  role?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  role = 'article',
  onClick,
  ...props
}: CardProps) {
  const isInteractive = hoverable || clickable;
  
  const variantClasses = {
    default: 'bg-background-page',
    bordered: 'bg-background-page border border-neutral-100',
    elevated: 'bg-background-page shadow-lg',
    interactive: 'bg-background-page border border-neutral-100 shadow-base hover:shadow-lg',
  };

  // Padding minimum de 32px (spacing-8) selon les spécifications
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-8', // Minimum 32px
    lg: 'p-12', // 48px
    xl: 'p-16', // 64px
  };

  const interactionClasses = isInteractive ? [
    'transition-fast',
    'ease-out',
    'cursor-default'
  ].join(' ') : '';

  const hoverClasses = hoverable ? [
    'hover:-translate-y-1',
    'hover:scale-101',
    'active:scale-99'
  ].join(' ') : '';

  const clickClasses = clickable ? [
    'cursor-pointer',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
    'hover:border-primary-200'
  ].join(' ') : '';

  const classes = [
    'rounded-md',
    'relative',
    variantClasses[variant],
    paddingClasses[padding],
    interactionClasses,
    hoverClasses,
    clickClasses,
    className
  ].filter(Boolean).join(' ');

  const CardWrapper = clickable ? 'button' : 'div';
  const ComponentProps = clickable ? {
    ...props,
    onClick,
    type: 'button' as const,
    'aria-pressed': undefined,
  } : props;

  return (
    <CardWrapper 
      className={classes}
      role={role}
      {...ComponentProps}
    >
      {children}
      
      {/* Indicateur visuel pour les éléments cliquables */}
      {clickable && (
        <div 
          className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-hidden="true"
        />
      )}
    </CardWrapper>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div 
      className={[
        'flex',
        'items-start',
        'justify-between',
        'mb-6',
        className
      ].join(' ')} 
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={[
            'text-h5',
            'font-semibold',
            'text-neutral-900',
            'leading-heading',
            'tracking-tight',
            'mb-2'
          ].join(' ')}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={[
            'text-small',
            'font-regular',
            'text-neutral-700',
            'leading-body'
          ].join(' ')}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ 
  children, 
  className = '', 
  ...props 
}: CardBodyProps) {
  return (
    <div 
      className={[
        'flex-1',
        'min-w-0',
        className
      ].join(' ')} 
      {...props}
    >
      {children}
    </div>
  );
}

// Alias pour compatibilité avec shadcn/ui
export const CardContent = CardBody;
export interface CardContentProps extends CardBodyProps {}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ 
  children, 
  className = '', 
  ...props 
}: CardTitleProps) {
  return (
    <h3 
      className={[
        'text-h5',
        'font-semibold',
        'text-neutral-900',
        'leading-heading',
        'tracking-tight',
        className
      ].join(' ')} 
      {...props}
    >
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ 
  children, 
  className = '', 
  ...props 
}: CardDescriptionProps) {
  return (
    <p 
      className={[
        'text-small',
        'font-regular',
        'text-neutral-700',
        'leading-body',
        'mt-2',
        className
      ].join(' ')} 
      {...props}
    >
      {children}
    </p>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export function CardFooter({
  children,
  align = 'right',
  className = '',
  ...props
}: CardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={[
        'flex',
        'items-center',
        'gap-3',
        'pt-6',
        'mt-6',
        'border-t',
        'border-neutral-100',
        'flex-shrink-0',
        alignClasses[align],
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
