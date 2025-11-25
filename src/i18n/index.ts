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

// Note: getRequestConfig is in /config/i18n.ts (configured in next.config.ts)
