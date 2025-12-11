/**
 * Feature: verification
 * Exports publics de la feature verification
 */

// Components
export { default as AnsutBadge } from './components/AnsutBadge';
export { default as CEVBadge } from './components/CEVBadge';
export { default as TrustIndicator } from './components/TrustIndicator';

// Verification forms
export { default as ONECIForm } from './components/ONECIForm';
export { default as CNAMForm } from './components/CNAMForm';

// Feature-gated verification forms (use these for automatic feature flag handling)
export { default as ONECIFormGated } from './components/ONECIFormGated';
export { default as CNAMFormGated } from './components/CNAMFormGated';
