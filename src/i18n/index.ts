// Configuration (testable without Next.js runtime)
export { defaultLocale, type Locale, localePrefix, locales } from './config';

// Routing and navigation utilities (requires Next.js runtime)
export {
  getPathname,
  Link,
  redirect,
  routing,
  usePathname,
  useRouter,
} from './routing';

// Per-request config using Next.js 15 async requestLocale API (locale detection for incoming requests)
export { default as getRequestConfig } from './request';
