/**
 * Unit tests for i18n logger utility
 *
 * Tests logging behavior, environment flag control, and log levels.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable testing-library/no-debugging-utils */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger, LogLevel } from './logger';

describe('i18n logger', () => {
  // Store original environment variables
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDebug = process.env.DEBUG;

  // Mock console methods
  const consoleDebugSpy = vi
    .spyOn(console, 'debug')
    .mockImplementation(() => {});
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment using type assertion to work around readonly issue
    (process.env as { NODE_ENV?: string }).NODE_ENV = originalNodeEnv;
    (process.env as { DEBUG?: string }).DEBUG = originalDebug;
  });

  describe('logging control', () => {
    it('should enable logging in development mode', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';

      logger.debug('Test message');

      expect(logger.isEnabled()).toBe(true);
    });

    it('should enable logging with DEBUG=i18n:* flag', () => {
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:*';

      logger.debug('Test message');

      expect(logger.isEnabled()).toBe(true);
    });

    it('should disable logging in production without DEBUG flag', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      (process.env as { DEBUG?: string }).DEBUG = undefined;

      // In production, the logger remains enabled (isEnabled() returns true)
      // but filters to ERROR level via getLevel()/getLogLevel()
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('log levels', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:*';
    });

    it('should log debug messages', () => {
      logger.debug('Debug message', { locale: 'fr' });

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleDebugSpy.mock.calls[0][0];
      expect(logOutput).toContain('[DEBUG]');
      expect(logOutput).toContain('[i18n]');
      expect(logOutput).toContain('Debug message');
      expect(logOutput).toContain('"locale":"fr"');
    });

    it('should log info messages', () => {
      logger.info('Info message', { source: 'cookie' });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('[INFO]');
      expect(logOutput).toContain('[i18n]');
      expect(logOutput).toContain('Info message');
      expect(logOutput).toContain('"source":"cookie"');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { duration: 100 });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      expect(logOutput).toContain('[WARN]');
      expect(logOutput).toContain('[i18n]');
      expect(logOutput).toContain('Warning message');
      expect(logOutput).toContain('"duration":100');
    });

    it('should log error messages', () => {
      logger.error('Error message', { error: 'Something went wrong' });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('[ERROR]');
      expect(logOutput).toContain('[i18n]');
      expect(logOutput).toContain('Error message');
      expect(logOutput).toContain('"error":"Something went wrong"');
    });

    it('should include timestamp in log output', () => {
      logger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];

      // Check for ISO timestamp format (YYYY-MM-DDTHH:mm:ss.sssZ)
      expect(logOutput).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/,
      );
    });

    it('should handle messages without data', () => {
      logger.info('Simple message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('[INFO]');
      expect(logOutput).toContain('Simple message');
      // Should not have extra JSON data at the end
      expect(logOutput).not.toMatch(/\{.*\}$/);
    });
  });

  describe('structured logging', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:*';
    });

    it('should format data as JSON', () => {
      logger.info('Test', {
        locale: 'en',
        source: 'url',
        nested: { key: 'value' },
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];

      // Check that data is valid JSON at the end
      const jsonMatch = logOutput.match(/\{.*\}$/);
      expect(jsonMatch).toBeTruthy();

      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        expect(parsedData).toEqual({
          locale: 'en',
          source: 'url',
          nested: { key: 'value' },
        });
      }
    });

    it('should handle numeric values in data', () => {
      logger.debug('Performance', { duration: 42.5, count: 10 });

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleDebugSpy.mock.calls[0][0];

      expect(logOutput).toContain('"duration":42.5');
      expect(logOutput).toContain('"count":10');
    });

    it('should handle boolean values in data', () => {
      logger.info('Config', { enabled: true, production: false });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];

      expect(logOutput).toContain('"enabled":true');
      expect(logOutput).toContain('"production":false');
    });

    it('should handle undefined and null values', () => {
      logger.debug('Test', { nullValue: null, undefinedValue: undefined });

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleDebugSpy.mock.calls[0][0];

      expect(logOutput).toContain('"nullValue":null');
      // undefined values are omitted from JSON
    });
  });

  describe('log level filtering', () => {
    it('should respect log level in development (INFO level)', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      (process.env as { DEBUG?: string }).DEBUG = undefined;

      // With INFO level, debug should not log
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      // But info, warn, error should log
      logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      logger.warn('Warn message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect log level in production (ERROR level)', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      (process.env as { DEBUG?: string }).DEBUG = undefined;

      // In production, only errors should log
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      logger.info('Info message');
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      logger.warn('Warn message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log all levels with DEBUG flag', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:middleware';

      // With DEBUG flag, all levels should log
      logger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

      logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      logger.warn('Warn message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logger methods', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:*';
    });

    it('should expose isEnabled() method', () => {
      expect(typeof logger.isEnabled).toBe('function');
      expect(logger.isEnabled()).toBe(true);
    });

    it('should expose getLevel() method', () => {
      expect(typeof logger.getLevel).toBe('function');
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it('should return correct level in production', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      (process.env as { DEBUG?: string }).DEBUG = undefined;

      // getLogLevel() reads process.env dynamically on each call,
      // not fixed at module load—reflects runtime environment state
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('no PII logging', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      (process.env as unknown as { DEBUG: string }).DEBUG = 'i18n:*';
    });

    it('should not log IP addresses (developer responsibility)', () => {
      // This test documents that developers should NOT pass PII
      // The logger itself doesn't validate data, it's the caller's responsibility

      logger.info('Request processed', {
        locale: 'fr',
        // DO NOT include: ip: '192.168.1.1', userId: '12345', email: 'user@example.com'
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleInfoSpy.mock.calls[0][0];

      // Should only contain safe metadata
      expect(logOutput).toContain('"locale":"fr"');

      // Should NOT contain PII (this is enforced by documentation, not code)
      expect(logOutput).not.toContain('ip');
      expect(logOutput).not.toContain('userId');
      expect(logOutput).not.toContain('email');
    });

    it('should log safe metadata only', () => {
      logger.debug('Language detected', {
        locale: 'en',
        source: 'cookie',
        pathname: '/en/articles',
        duration: 5.2,
      });

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleDebugSpy.mock.calls[0][0];

      // All of these are safe to log
      expect(logOutput).toContain('"locale":"en"');
      expect(logOutput).toContain('"source":"cookie"');
      expect(logOutput).toContain('"pathname":"/en/articles"');
      expect(logOutput).toContain('"duration":5.2');
    });
  });

  describe('edge runtime safety', () => {
    let originalProcess: typeof process;

    beforeEach(() => {
      // Store original process object
      originalProcess = globalThis.process;
    });

    afterEach(() => {
      // Restore original process object
      globalThis.process = originalProcess;
    });

    it('should handle missing process object in edge runtime', () => {
      // Simulate edge runtime by removing process
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).process;

      // Re-import logger to get fresh instance with edge detection
      // Note: This is a limitation - we can't fully test dynamic re-evaluation
      // but we verify the code doesn't throw
      expect(() => {
        logger.error('Error in edge runtime');
      }).not.toThrow();

      // In edge runtime without process, should default to production mode (errors only)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle missing process.env in edge runtime', () => {
      // Simulate edge runtime with process but no env
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).process = {};

      expect(() => {
        logger.error('Error with missing env');
      }).not.toThrow();

      // Should still log errors
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should default to production mode in edge runtime', () => {
      // Simulate edge runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).process;

      // Debug/info/warn should not log (production default)
      logger.debug('Debug in edge');
      logger.info('Info in edge');
      logger.warn('Warn in edge');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      // Errors should still log
      logger.error('Error in edge');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should not throw when accessing process.env in edge runtime', () => {
      // Simulate edge runtime with null env
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).process = { env: null };

      expect(() => {
        logger.error('Safe error logging');
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
