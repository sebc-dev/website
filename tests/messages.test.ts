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
   * Test: French file has expected number of keys (~50)
   * Expected: Total key count is approximately 50
   */
  it('should have approximately 50 keys in French message file', () => {
    const messages = loadMessages('fr');
    const totalKeys = Object.values(messages).reduce(
      (sum: number, namespace: Record<string, string>) => sum + Object.keys(namespace).length,
      0,
    );

    // Allow some flexibility (45-55 keys acceptable)
    expect(totalKeys).toBeGreaterThanOrEqual(45);
    expect(totalKeys).toBeLessThanOrEqual(55);
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
});
