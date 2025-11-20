// Types
export type { Locale } from './types';

// Routing configuration
export { routing } from './routing';
export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr';

// Navigation utilities
export { Link, redirect, usePathname, useRouter, getPathname } from './routing';

// Request config (for next.config.js)
export { default as getRequestConfig } from './request';
