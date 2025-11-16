/**
 * Integration tests for i18n context initialization
 *
 * Tests cover:
 * - i18n configuration validation
 * - Module exports and availability
 * - Cookie and redirect integration
 * - Routing configuration
 *
 * @see ../../middleware.ts
 * @see ../../i18n/config.ts
 */

import { describe, expect, it } from 'vitest';

import { defaultLocale, locales } from '@/i18n/config';

/**
 * Test suite for i18n configuration
 */
describe('i18n Configuration', () => {
  it('should export locales array', () => {
    expect(locales).toBeDefined();
    expect(Array.isArray(locales)).toBe(true);
  });

  it('should include fr and en in locales', () => {
    expect(locales).toContain('fr');
    expect(locales).toContain('en');
  });

  it('should export defaultLocale', () => {
    expect(defaultLocale).toBeDefined();
    expect(defaultLocale).toBe('fr');
  });

  it('should have defaultLocale in locales array', () => {
    expect(locales).toContain(defaultLocale);
  });
});

/**
 * Test suite for cookie and redirect utilities
 */
describe('Cookie and Redirect Utilities', () => {
  it('should export cookie utilities', async () => {
    const cookieModule = await import('./cookie');
    expect(cookieModule.getCookie).toBeDefined();
    expect(cookieModule.setCookie).toBeDefined();
    expect(cookieModule.deleteCookie).toBeDefined();
    expect(cookieModule.validateLocale).toBeDefined();
  });

  it('should export redirect utilities', async () => {
    const redirectModule = await import('./redirect');
    expect(redirectModule.handleRootPathRedirect).toBeDefined();
    expect(redirectModule.isRootPath).toBeDefined();
  });
});

/**
 * Test suite for routing configuration
 */
describe('Routing Configuration', () => {
  it('should export routingConfig', async () => {
    const configModule = await import('@/i18n/config');
    expect(configModule.routingConfig).toBeDefined();
  });

  it('should have localePrefix set to always', async () => {
    const configModule = await import('@/i18n/config');
    expect(configModule.routingConfig.localePrefix).toBe('always');
  });
});

/**
 * Test suite for integration flow validation
 */
describe('Integration Flow Validation', () => {
  it('should have all Phase 2 utility components available', async () => {
    // Import utility modules (avoid middleware due to next-intl dependencies)
    const [cookieModule, redirectModule, configModule] = await Promise.all([
      import('./cookie'),
      import('./redirect'),
      import('@/i18n/config'),
    ]);

    // Verify all critical exports are available
    expect(cookieModule.setCookie).toBeDefined();
    expect(redirectModule.handleRootPathRedirect).toBeDefined();
    expect(configModule.locales).toBeDefined();
    expect(configModule.defaultLocale).toBe('fr');
  });

  it('should have consistent locale types across modules', async () => {
    const configModule = await import('@/i18n/config');
    
    // Verify locales are consistent
    expect(configModule.locales).toEqual(['fr', 'en']);
    expect(configModule.defaultLocale).toBe('fr');
  });
});

/**
 * Test suite for secure cookie flags
 */
describe('Secure Cookie Flags', () => {
  it('should create cookies with all required security flags', async () => {
    const { setCookie } = await import('./cookie');
    
    const cookie = setCookie('NEXT_LOCALE', 'fr');
    
    // Verify all security flags are present
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=31536000'); // 1 year
    expect(cookie).toContain('Path=/');
  });

  it('should validate locales before accepting cookie values', async () => {
    const { validateLocale } = await import('./cookie');
    
    expect(validateLocale('fr')).toBe(true);
    expect(validateLocale('en')).toBe(true);
    expect(validateLocale('de')).toBe(false);
    expect(validateLocale('invalid')).toBe(false);
  });
});

/**
 * Test suite for URL redirection behavior
 */
describe('URL Redirection Behavior', () => {
  it('should correctly identify root paths for redirection', async () => {
    const { isRootPath } = await import('./redirect');
    
    expect(isRootPath('/')).toBe(true);
    expect(isRootPath('//')).toBe(true);
    expect(isRootPath('/fr/')).toBe(false);
    expect(isRootPath('/en/')).toBe(false);
    expect(isRootPath('/articles')).toBe(false);
  });
});

/**
 * Test suite for Phase 2 implementation completeness
 */
describe('Phase 2 Implementation Completeness', () => {
  it('should have cookie management system ready', async () => {
    const { getCookie, setCookie, deleteCookie, validateLocale } = await import('./cookie');
    
    expect(typeof getCookie).toBe('function');
    expect(typeof setCookie).toBe('function');
    expect(typeof deleteCookie).toBe('function');
    expect(typeof validateLocale).toBe('function');
  });

  it('should have redirect system ready', async () => {
    const { handleRootPathRedirect, isRootPath } = await import('./redirect');
    
    expect(typeof handleRootPathRedirect).toBe('function');
    expect(typeof isRootPath).toBe('function');
  });

  it('should have routing configuration ready', async () => {
    const { routingConfig, locales, defaultLocale } = await import('@/i18n/config');
    
    expect(routingConfig.localePrefix).toBe('always');
    expect(locales.length).toBe(2);
    expect(defaultLocale).toBe('fr');
  });
});
