import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures the Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);
