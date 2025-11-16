/**
 * Message File Validation Tests
 *
 * This test suite validates the message files (messages/fr.json and messages/en.json)
 * ensuring they are properly structured, encoded, and contain expected translations.
 *
 * Tests cover:
 * - JSON syntax validity
 * - UTF-8 encoding
 * - Namespace structure
 * - Translation value presence and validity
 * - Key count expectations
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Helper function to load and parse message files
 * @param locale - The locale code ('fr' or 'en')
 * @returns Parsed message object
 */
function loadMessages(locale: 'fr' | 'en'): Record<string, Record<string, string>> {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as Record<string, Record<string, string>>;
}

describe('Message Files - JSON Validity', () => {
  /**
   * Test: French message file is valid JSON
   * Expected: File parses without errors
   */
  it('should parse French message file (fr.json) without errors', () => {
    const messages = loadMessages('fr');
    expect(messages).toBeDefined();
    expect(typeof messages).toBe('object');
  });

  /**
   * Test: English message file is valid JSON
   * Expected: File parses without errors
   */
  it('should parse English message file (en.json) without errors', () => {
    const messages = loadMessages('en');
    expect(messages).toBeDefined();
    expect(typeof messages).toBe('object');
  });
});

describe('Message Files - Encoding & Structure', () => {
  /**
   * Test: French file uses UTF-8 encoding
   * Expected: File contains French accented characters
   */
  it('should have French message file properly UTF-8 encoded', () => {
    const filePath = path.join(process.cwd(), 'messages', 'fr.json');
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for French accented characters that indicate proper UTF-8 encoding
    // Accented characters: é, è, ê, ë, à, â, ä, ù, û, ü, ô, ö, ç, œ, æ
    const hasAccents = /[éèêëàâäùûüôöçœæ]/.test(content);
    expect(hasAccents).toBe(true);
  });

  /**
   * Test: English file is properly formatted
   * Expected: File is valid JSON
   */
  it('should have English message file properly formatted', () => {
    const filePath = path.join(process.cwd(), 'messages', 'en.json');
    const content = fs.readFileSync(filePath, 'utf8');

    // Should be valid JSON
    let parsed: unknown;
    expect(() => {
      parsed = JSON.parse(content);
    }).not.toThrow();
    expect(typeof parsed).toBe('object');
  });
});

describe('Message Files - Namespace Structure', () => {
  /**
   * Test: All 8 namespaces exist in French file
   * Expected: common, nav, footer, form, article, complexity, search, error
   */
  it('should have all 8 namespaces in French message file', () => {
    const messages = loadMessages('fr');
    const expectedNamespaces = [
      'article',
      'common',
      'complexity',
      'error',
      'footer',
      'form',
      'nav',
      'search',
    ];

    expectedNamespaces.forEach((namespace) => {
      expect(messages).toHaveProperty(namespace);
      expect(typeof messages[namespace]).toBe('object');
    });
  });

  /**
   * Test: All 8 namespaces exist in English file
   * Expected: Same structure as French file
   */
  it('should have all 8 namespaces in English message file', () => {
    const messages = loadMessages('en');
    const expectedNamespaces = [
      'article',
      'common',
      'complexity',
      'error',
      'footer',
      'form',
      'nav',
      'search',
    ];

    expectedNamespaces.forEach((namespace) => {
      expect(messages).toHaveProperty(namespace);
      expect(typeof messages[namespace]).toBe('object');
    });
  });

  /**
   * Test: Translation keys within namespaces are properly formatted
   * Expected: All keys are strings with proper namespace grouping
   */
  it('should have all translation keys properly grouped within namespaces in French file', () => {
    const messages = loadMessages('fr');

    Object.entries(messages).forEach(([, keys]) => {
      // Each namespace should have its keys as an object
      expect(typeof keys).toBe('object');
      expect(Array.isArray(keys)).toBe(false);

      // All keys should be strings
      Object.entries(keys).forEach(([keyName, value]) => {
        expect(typeof keyName).toBe('string');
        expect(keyName.length).toBeGreaterThan(0);
        expect(typeof value).toBe('string');
      });
    });
  });
});

describe('Message Files - Translation Values', () => {
  /**
   * Test: No empty string values in French translations
   * Expected: All translation values are non-empty strings
   */
  it('should have no empty translation values in French file', () => {
    const messages = loadMessages('fr');

    Object.entries(messages).forEach(([, keys]) => {
      Object.entries(keys).forEach(([, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  /**
   * Test: No empty string values in English translations
   * Expected: All translation values are non-empty strings
   */
  it('should have no empty translation values in English file', () => {
    const messages = loadMessages('en');

    Object.entries(messages).forEach(([, keys]) => {
      Object.entries(keys).forEach(([, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  /**
   * Test: All values are strings (basic type validation)
   * Expected: No numbers, booleans, or nested objects as values
   */
  it('should have all translation values as strings in French file', () => {
    const messages = loadMessages('fr');

    Object.entries(messages).forEach(([, namespace]) => {
      Object.values(namespace).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });

  /**
   * Test: All values are strings in English file
   * Expected: Consistent type across both files
   */
  it('should have all translation values as strings in English file', () => {
    const messages = loadMessages('en');

    Object.entries(messages).forEach(([, namespace]) => {
      Object.values(namespace).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });
});

describe('Message Files - Key Count Validation', () => {
  /**
   * Test: French file has expected number of keys (~70+)
   * Expected: Total key count is approximately 70+ after all translations
   */
  it('should have approximately 70+ keys in French message file', () => {
    const messages = loadMessages('fr');
    const totalKeys = Object.values(messages).reduce(
      (sum: number, namespace: Record<string, string>) => sum + Object.keys(namespace).length,
      0,
    );

    // Allow some flexibility (65-75 keys acceptable)
    expect(totalKeys).toBeGreaterThanOrEqual(65);
    expect(totalKeys).toBeLessThanOrEqual(75);
  });

  /**
   * Test: Specific namespace key counts in French file
   * Expected: Each namespace has expected number of keys
   */
  it('should have expected key distribution across French namespaces', () => {
    const messages = loadMessages('fr');

    // Verify each namespace has keys (exact counts can vary, but shouldn't be empty)
    expect(Object.keys(messages.common).length).toBeGreaterThan(0);
    expect(Object.keys(messages.nav).length).toBeGreaterThan(0);
    expect(Object.keys(messages.footer).length).toBeGreaterThan(0);
    expect(Object.keys(messages.form).length).toBeGreaterThan(0);
    expect(Object.keys(messages.article).length).toBeGreaterThan(0);
    expect(Object.keys(messages.complexity).length).toBeGreaterThan(0);
    expect(Object.keys(messages.search).length).toBeGreaterThan(0);
    expect(Object.keys(messages.error).length).toBeGreaterThan(0);
  });
});

describe('Message Files - Parameterized Values', () => {
  /**
   * Test: Article namespace has parameterized values with correct syntax
   * Expected: Variables use named variable syntax (not numeric indexes)
   */
  it('should have parameterized values in article namespace using correct syntax', () => {
    const messages = loadMessages('fr');

    // Check that article translations use minutes and date placeholders
    const readingTime = messages.article.readingTime;
    if (readingTime) {
      expect(readingTime.includes('{minutes}')).toBe(true);
    }

    const publishedOn = messages.article.publishedOn;
    if (publishedOn) {
      expect(publishedOn.includes('{date}')).toBe(true);
    }

    const updatedOn = messages.article.updatedOn;
    if (updatedOn) {
      expect(updatedOn.includes('{date}')).toBe(true);
    }
  });

  /**
   * Test: No legacy numbered placeholders used
   * Expected: All placeholders use named variables
   */
  it('should not use numbered placeholders in message values', () => {
    const messages = loadMessages('fr');

    Object.entries(messages).forEach(([, namespace]) => {
      Object.values(namespace).forEach((value) => {
        // Check that no numbered placeholders like {0}, {1} exist
        const hasNumberedPlaceholders = /\{\d+\}/.test(value);
        expect(hasNumberedPlaceholders).toBe(false);
      });
    });
  });
});

/**
 * Helper function to recursively extract all nested key paths from an object
 * @param obj - Object to extract keys from
 * @param prefix - Current key path prefix
 * @returns Array of full key paths (e.g., ['common.appName', 'nav.home'])
 */
function getNestedKeys(
  obj: Record<string, unknown>,
  prefix = '',
): string[] {
  const keys: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      // Skip null/undefined values
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively get nested keys
      const nestedKeys = getNestedKeys(value as Record<string, unknown>, fullPath);
      keys.push(...nestedKeys);
    } else if (typeof value === 'string') {
      // Leaf node is a string value
      keys.push(fullPath);
    }
  });

  return keys;
}

/**
 * Helper function to safely retrieve a value at a nested path
 * @param obj - Object to retrieve from
 * @param path - Dot-separated path (e.g., 'common.appName')
 * @returns The value at the path, or undefined if not found
 */
function getValueByPath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

describe('Message Files - Key Parity Validation', () => {
  /**
   * Test: All French keys exist in English (forward parity)
   * Expected: No missing keys in English file
   */
  it('should have all French keys exist in English file (forward parity)', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    const frenchKeys = getNestedKeys(frMessages);
    const missingKeys: string[] = [];

    frenchKeys.forEach((keyPath) => {
      const value = getValueByPath(enMessages, keyPath);
      if (value === undefined) {
        missingKeys.push(keyPath);
      }
    });

    if (missingKeys.length > 0) {
      throw new Error(`Missing English translations for: ${missingKeys.join(', ')}`);
    }
    expect(missingKeys).toEqual([]);
  });

  /**
   * Test: All English keys exist in French (reverse parity)
   * Expected: No extra keys in English that don't exist in French
   */
  it('should have all English keys exist in French file (reverse parity)', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    const englishKeys = getNestedKeys(enMessages);
    const extraKeys: string[] = [];

    englishKeys.forEach((keyPath) => {
      const value = getValueByPath(frMessages, keyPath);
      if (value === undefined) {
        extraKeys.push(keyPath);
      }
    });

    if (extraKeys.length > 0) {
      throw new Error(`Extra English translations not in French: ${extraKeys.join(', ')}`);
    }
    expect(extraKeys).toEqual([]);
  });

  /**
   * Test: Key counts match between French and English
   * Expected: Both files have identical number of keys
   */
  it('should have matching key counts between French and English files', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    const frenchKeys = getNestedKeys(frMessages);
    const englishKeys = getNestedKeys(enMessages);

    if (englishKeys.length !== frenchKeys.length) {
      throw new Error(
        `English has ${englishKeys.length} keys but French has ${frenchKeys.length}`,
      );
    }
    expect(englishKeys.length).toBe(frenchKeys.length);
  });
});

describe('Message Files - Parameterized Translation Validation', () => {
  /**
   * Test: Parameterized translations have consistent variable names
   * Expected: Same variables in French and English translations
   */
  it('should have consistent parameterized variables between French and English', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    // Get all keys with parameters
    const allKeys = getNestedKeys(frMessages);
    const inconsistencies: string[] = [];

    allKeys.forEach((keyPath) => {
      const frValueRaw = getValueByPath(frMessages, keyPath);
      const enValueRaw = getValueByPath(enMessages, keyPath);

      const frValue = typeof frValueRaw === 'string' ? frValueRaw : '';
      const enValue = typeof enValueRaw === 'string' ? enValueRaw : '';

      // Extract all {variable} placeholders
      const frVariables = Array.from(frValue.matchAll(/\{(\w+)\}/g), (m) => m[1]).sort();
      const enVariables = Array.from(enValue.matchAll(/\{(\w+)\}/g), (m) => m[1]).sort();

      if (JSON.stringify(frVariables) !== JSON.stringify(enVariables)) {
        inconsistencies.push(
          `${keyPath}: FR=[${frVariables.join(', ')}] EN=[${enVariables.join(', ')}]`,
        );
      }
    });

    if (inconsistencies.length > 0) {
      throw new Error(
        `Parameterized variable inconsistencies: ${inconsistencies.join('; ')}`,
      );
    }
    expect(inconsistencies).toEqual([]);
  });

  /**
   * Test: Parameterized translations can be substituted
   * Expected: Example substitutions work correctly
   */
  it('should allow example parameterized substitutions in article namespace', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    // Test readingTime substitution
    const frReadingTime = frMessages.article?.readingTime || '';
    const enReadingTime = enMessages.article?.readingTime || '';

    const exampleMinutes = '5';
    const frResult = frReadingTime.replace('{minutes}', exampleMinutes);
    const enResult = enReadingTime.replace('{minutes}', exampleMinutes);

    expect(frResult).toContain('5');
    expect(enResult).toContain('5');
    expect(frResult).not.toContain('{minutes}');
    expect(enResult).not.toContain('{minutes}');

    // Test publishedOn substitution
    const frPublished = frMessages.article?.publishedOn || '';
    const enPublished = enMessages.article?.publishedOn || '';

    const exampleDate = 'November 16, 2025';
    const frDateResult = frPublished.replace('{date}', exampleDate);
    const enDateResult = enPublished.replace('{date}', exampleDate);

    expect(frDateResult).toContain('November 16, 2025');
    expect(enDateResult).toContain('November 16, 2025');
  });
});

describe('Message Files - Integration', () => {
  /**
   * Test: French and English files have same namespace structure
   * Expected: Both files contain identical namespace keys
   */
  it('should have matching namespace structure between French and English files', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    const frNamespaces = Object.keys(frMessages).sort();
    const enNamespaces = Object.keys(enMessages).sort();

    expect(frNamespaces).toEqual(enNamespaces);
  });

  /**
   * Test: Can access sample translations from both files
   * Expected: Common translations accessible via standard keys
   */
  it('should have accessible common translations in both files', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    // Verify that some expected keys exist and are accessible
    expect(frMessages.common).toBeDefined();
    expect(enMessages.common).toBeDefined();

    // Common namespace should have certain keys
    const commonKeys = Object.keys(frMessages.common);
    expect(commonKeys.length).toBeGreaterThan(0);
  });

  /**
   * Test: No undefined or null values in message files
   * Expected: All translation values are non-null strings
   */
  it('should have no null or undefined values in either message file', () => {
    const frMessages = loadMessages('fr');
    const enMessages = loadMessages('en');

    const validateNoNulls = (messages: Record<string, unknown>) => {
      Object.entries(messages).forEach(([, namespaceObj]) => {
        if (typeof namespaceObj === 'object' && namespaceObj !== null) {
          Object.entries(namespaceObj as Record<string, unknown>).forEach(
            ([, value]) => {
              expect(value).not.toBeNull();
              expect(value).not.toBeUndefined();
              expect(typeof value).toBe('string');
            },
          );
        }
      });
    };

    validateNoNulls(frMessages);
    validateNoNulls(enMessages);
  });
});
