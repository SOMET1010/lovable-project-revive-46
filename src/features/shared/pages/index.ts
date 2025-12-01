// Pages
export { default as ContactPage } from './ContactPage';
export { default as HelpPage } from './HelpPage';
export { default as FAQPage } from './FAQPage';

// Export depuis le dossier components
export { default as ContactForm } from '../components/ContactForm';
export { default as FAQAccordion } from '../components/FAQAccordion';

// Export depuis le dossier hooks
export { useContact } from '../hooks/useContact';
export { useHelp } from '../hooks/useHelp';
export { useFAQ } from '../hooks/useFAQ';

// Export depuis le dossier services
export { contactService, ContactService } from '../services/contactService';
export { helpService } from '../services/helpService';

// Types
export type {
  ContactFormData,
  ContactResponse
} from '../hooks/useContact';

export type {
  FAQItem,
  FAQCategory,
  FAQSearchResult,
  UseFAQReturn
} from '../hooks/useFAQ';

export type {
  ContactSubmission,
  ContactResponse as ContactServiceResponse
} from '../services/contactService';
