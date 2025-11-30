/**
 * UI Component Library
 * Export all reusable UI components from here
 */

export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardTitleProps, CardDescriptionProps, CardContentProps } from './Card';

export { default as Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';

export { Skeleton, SkeletonText, PropertyCardSkeleton, PropertyDetailSkeleton, FormSkeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Démonstration des composants refactorisés
export { default as UIComponentsDemo } from './UIComponentsDemo';
