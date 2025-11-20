// Configuration (testable without Next.js runtime)
export { defaultLocale, type Locale, localePrefix, locales } from './config';

// Routing (requires Next.js runtime)
export { routing } from './routing';

// Navigation utilities (requires Next.js runtime)
export { getPathname, Link, redirect, usePathname, useRouter } from './routing';

// Request config (for next.config.js)
export { default as getRequestConfig } from './request';
