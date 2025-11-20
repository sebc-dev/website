// Configuration only - no navigation utilities (testable without Next.js runtime)
export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr' as const;
export const localePrefix = 'always' as const;

export type Locale = (typeof locales)[number];
