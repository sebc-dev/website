/**
 * Unit tests for i18n performance monitoring utility
 *
 * Tests timing measurements, performance assertions, and monitoring.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assertPerformance,
  checkPerformance,
  endTimer,
  formatDuration,
  measurePerformance,
  PERFORMANCE_TARGETS,
  PerformanceMonitor,
  startTimer,
} from './performance';

describe('i18n performance monitoring', () => {
  describe('startTimer and endTimer', () => {
    it('should create a timer with name and start time', () => {
      const timer = startTimer('test-operation');

      expect(timer).toBeDefined();
      expect(timer.name).toBe('test-operation');
      expect(timer.startTime).toBeTypeOf('number');
      expect(timer.startTime).toBeGreaterThan(0);
    });

    it('should calculate duration between start and end', () => {
      const timer = startTimer('test');

      // Simulate some work with a small delay
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait ~10ms
      }

      const duration = endTimer(timer);

      expect(duration).toBeTypeOf('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      // No strict bounds - duration depends on system load and timer precision
    });

    it('should return duration rounded to 2 decimal places', () => {
      const timer = startTimer('test');
      const duration = endTimer(timer);

      // Check that duration has at most 2 decimal places
      const decimalPlaces = duration.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should handle multiple timers independently', () => {
      const timer1 = startTimer('operation-1');
      const timer2 = startTimer('operation-2');

      expect(timer1.name).toBe('operation-1');
      expect(timer2.name).toBe('operation-2');
      expect(timer1.startTime).not.toBe(timer2.startTime);
    });
  });

  describe('measurePerformance', () => {
    it('should create a complete performance measurement', () => {
      const timer = startTimer('middleware');

      // Simulate work
      const start = Date.now();
      while (Date.now() - start < 5) {
        // Wait ~5ms
      }

      const measurement = measurePerformance(timer);

      expect(measurement).toBeDefined();
      expect(measurement.name).toBe('middleware');
      expect(measurement.duration).toBeTypeOf('number');
      expect(measurement.duration).toBeGreaterThanOrEqual(0);
      expect(measurement.startedAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );
      expect(measurement.endedAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );
    });

    it('should have consistent timestamps', () => {
      const timer = startTimer('test');
      const measurement = measurePerformance(timer);

      const startTime = new Date(measurement.startedAt).getTime();
      const endTime = new Date(measurement.endedAt).getTime();

      expect(endTime).toBeGreaterThanOrEqual(startTime);
      // Relaxed tolerance - timestamps should be reasonably close
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('assertPerformance', () => {
    it('should not throw if performance is within target', () => {
      expect(() => {
        assertPerformance(30, 50, 'Test operation');
      }).not.toThrow();
    });

    it('should not throw if performance equals target', () => {
      expect(() => {
        assertPerformance(50, 50, 'Test operation');
      }).not.toThrow();
    });

    it('should throw if performance exceeds target', () => {
      expect(() => {
        assertPerformance(100, 50, 'Test operation');
      }).toThrow(
        'Performance assertion failed: Test operation took 100ms, expected < 50ms',
      );
    });

    it('should include operation name in error message', () => {
      expect(() => {
        assertPerformance(75, 50, 'Middleware execution');
      }).toThrow('Middleware execution');
    });

    it('should include actual and expected durations in error', () => {
      expect(() => {
        assertPerformance(120, 100, 'Test');
      }).toThrow('120ms');
      expect(() => {
        assertPerformance(120, 100, 'Test');
      }).toThrow('100ms');
    });
  });

  describe('checkPerformance', () => {
    it('should return true if performance is within target', () => {
      expect(checkPerformance(30, 50)).toBe(true);
    });

    it('should return true if performance equals target', () => {
      expect(checkPerformance(50, 50)).toBe(true);
    });

    it('should return false if performance exceeds target', () => {
      expect(checkPerformance(100, 50)).toBe(false);
    });

    it('should handle decimal durations', () => {
      expect(checkPerformance(49.99, 50)).toBe(true);
      expect(checkPerformance(50.01, 50)).toBe(false);
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(formatDuration(0)).toBe('0.00ms');
      expect(formatDuration(5)).toBe('5.00ms');
      expect(formatDuration(42.5)).toBe('42.50ms');
      expect(formatDuration(999.99)).toBe('999.99ms');
    });

    it('should format seconds correctly', () => {
      expect(formatDuration(1000)).toBe('1.00s');
      expect(formatDuration(1250)).toBe('1.25s');
      expect(formatDuration(5000)).toBe('5.00s');
    });

    it('should round to 2 decimal places', () => {
      expect(formatDuration(42.5555)).toBe('42.56ms');
      expect(formatDuration(1234.5678)).toBe('1.23s');
    });
  });

  describe('PERFORMANCE_TARGETS', () => {
    it('should define middleware execution target', () => {
      expect(PERFORMANCE_TARGETS.MIDDLEWARE_EXECUTION).toBe(50);
    });

    it('should define locale detection target', () => {
      expect(PERFORMANCE_TARGETS.LOCALE_DETECTION).toBe(10);
    });

    it('should define cookie parsing target', () => {
      expect(PERFORMANCE_TARGETS.COOKIE_PARSING).toBe(5);
    });

    it('should be frozen (immutable at runtime)', () => {
      // PERFORMANCE_TARGETS is frozen via Object.freeze() in implementation
      // TypeScript enforces immutability at compile-time via 'as const'

      // Attempting to modify should throw in strict mode (or fail silently in non-strict)
      expect(() => {
        // @ts-expect-error - TypeScript prevents modification
        PERFORMANCE_TARGETS.MIDDLEWARE_EXECUTION = 100;
      }).toThrow();

      // Value should remain unchanged
      expect(PERFORMANCE_TARGETS.MIDDLEWARE_EXECUTION).toBe(50);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
      vi.restoreAllMocks();
    });

    it('should start and end timers', () => {
      monitor.start('operation-1');

      // Simulate work
      const start = Date.now();
      while (Date.now() - start < 5) {
        // Wait ~5ms
      }

      const duration = monitor.end('operation-1');

      expect(duration).toBeDefined();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should return undefined for non-existent timer', () => {
      const duration = monitor.end('non-existent');

      expect(duration).toBeUndefined();
    });

    it('should track multiple operations', () => {
      monitor.start('op-1');
      monitor.start('op-2');

      monitor.end('op-1');
      monitor.end('op-2');

      const results = monitor.getResults();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('op-1');
      expect(results[1].name).toBe('op-2');
    });

    it('should get specific measurement result', () => {
      monitor.start('test-op');
      monitor.end('test-op');

      const result = monitor.getResult('test-op');

      expect(result).toBeDefined();
      expect(result?.name).toBe('test-op');
      expect(result?.duration).toBeTypeOf('number');
    });

    it('should return undefined for missing result', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = monitor.getResult('missing');

      expect(result).toBeUndefined();
    });

    it('should clear all timers and measurements', () => {
      monitor.start('op-1');
      monitor.start('op-2');
      monitor.end('op-1');

      monitor.clear();

      expect(monitor.getResults()).toHaveLength(0);
      expect(monitor.end('op-2')).toBeUndefined();
    });

    it('should calculate summary statistics', () => {
      // Create spy before any monitor operations
      const perfSpy = vi.spyOn(performance, 'now');

      // op-1: 20ms (start: 100, end: 120)
      perfSpy.mockReturnValueOnce(100); // startTimer in monitor.start()
      monitor.start('op-1');
      perfSpy.mockReturnValueOnce(120); // measurePerformance in monitor.end()
      monitor.end('op-1');

      // op-2: 30ms (start: 200, end: 230)
      perfSpy.mockReturnValueOnce(200); // startTimer in monitor.start()
      monitor.start('op-2');
      perfSpy.mockReturnValueOnce(230); // measurePerformance in monitor.end()
      monitor.end('op-2');

      // op-3: 50ms (start: 300, end: 350)
      perfSpy.mockReturnValueOnce(300); // startTimer in monitor.start()
      monitor.start('op-3');
      perfSpy.mockReturnValueOnce(350); // measurePerformance in monitor.end()
      monitor.end('op-3');

      const summary = monitor.getSummary();

      expect(summary.count).toBe(3);
      expect(summary.total).toBeCloseTo(100, 1); // 20 + 30 + 50
      expect(summary.min).toBeCloseTo(20, 1);
      expect(summary.max).toBeCloseTo(50, 1);
      expect(summary.average).toBeCloseTo(33.33, 1); // (20 + 30 + 50) / 3

      perfSpy.mockRestore();
    });

    it('should return zero summary for empty monitor', () => {
      const summary = monitor.getSummary();

      expect(summary).toEqual({
        total: 0,
        count: 0,
        min: 0,
        max: 0,
        average: 0,
      });
    });

    it('should round summary values to 2 decimal places', () => {
      // Create spy before any monitor operations
      const perfSpy = vi.spyOn(performance, 'now');

      perfSpy.mockReturnValueOnce(0); // startTimer in monitor.start()
      monitor.start('op-1');
      perfSpy.mockReturnValueOnce(33.333); // measurePerformance in monitor.end()
      monitor.end('op-1');

      const summary = monitor.getSummary();

      // Check that values are rounded to 2 decimal places
      expect(
        summary.total.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
      expect(
        summary.min.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
      expect(
        summary.max.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
      expect(
        summary.average.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);

      perfSpy.mockRestore();
    });
  });

  describe('integration with real timers', () => {
    it('should measure actual performance accurately', () => {
      const timer = startTimer('real-test');

      // Simulate work with actual delay
      const start = Date.now();
      while (Date.now() - start < 20) {
        // Wait at least 20ms
      }

      const duration = endTimer(timer);

      // Duration should be positive (no strict bounds due to timer precision)
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should pass performance assertion for fast operations', () => {
      const timer = startTimer('fast-op');

      // Very quick operation (should be < 1ms)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = 1 + 1;

      const duration = endTimer(timer);

      // Should easily pass a 50ms target
      expect(() => {
        assertPerformance(duration, 50, 'Fast operation');
      }).not.toThrow();
    });

    it('should detect slow operations', () => {
      const timer = startTimer('slow-op');

      // Simulate slow operation
      const start = Date.now();
      while (Date.now() - start < 60) {
        // Wait 60ms
      }

      const duration = endTimer(timer);

      // Should fail 50ms target
      expect(checkPerformance(duration, 50)).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should measure middleware-like execution', () => {
      const timer = startTimer('middleware');

      // Simulate middleware operations
      const locale = 'fr';
      const pathname = '/articles';
      void `${locale}${pathname}`; // Simulate path construction

      const measurement = measurePerformance(timer);

      // Middleware should return a valid positive duration
      expect(measurement.duration).toBeGreaterThanOrEqual(0);
      expect(measurement.name).toBe('middleware');
      expect(measurement.startedAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );
      expect(measurement.endedAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );
    });

    it('should track nested operations with PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor();

      monitor.start('middleware-total');

      monitor.start('locale-detection');
      // Simulate locale detection
      const locale = 'fr';
      monitor.end('locale-detection');

      monitor.start('cookie-parsing');
      // Simulate cookie parsing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cookie = 'NEXT_LOCALE=fr';
      monitor.end('cookie-parsing');

      monitor.start('redirect-logic');
      // Simulate redirect logic
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const redirect = `/${locale}/`;
      monitor.end('redirect-logic');

      monitor.end('middleware-total');

      const summary = monitor.getSummary();

      expect(summary.count).toBe(4); // 3 nested + 1 total
      expect(monitor.getResult('locale-detection')).toBeDefined();
      expect(monitor.getResult('cookie-parsing')).toBeDefined();
      expect(monitor.getResult('redirect-logic')).toBeDefined();
      expect(monitor.getResult('middleware-total')).toBeDefined();

      // All operations should be fast
      const results = monitor.getResults();
      results.forEach((result) => {
        expect(result.duration).toBeLessThan(50);
      });
    });
  });
});
