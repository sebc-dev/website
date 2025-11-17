/**
 * Performance monitoring utility for i18n middleware
 *
 * Provides timing measurements and performance assertions for middleware execution.
 * Uses `performance.now()` for high-resolution timing.
 *
 * Target: Middleware execution should be < 50ms
 *
 * @example
 * import { startTimer, endTimer, assertPerformance } from '@/lib/i18n/performance';
 *
 * const timer = startTimer('middleware');
 * // ... middleware logic ...
 * const duration = endTimer(timer);
 * assertPerformance(duration, 50, 'Middleware execution');
 */

/**
 * Performance timer structure
 */
export interface PerformanceTimer {
  /**
   * Name/label for this timer
   */
  name: string;

  /**
   * Start time in milliseconds (from performance.now())
   */
  startTime: number;
}

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
  /**
   * Name of the measured operation
   */
  name: string;

  /**
   * Duration in milliseconds
   */
  duration: number;

  /**
   * Start time (ISO timestamp)
   */
  startedAt: string;

  /**
   * End time (ISO timestamp)
   */
  endedAt: string;
}

/**
 * Target performance thresholds (in milliseconds)
 */
export const PERFORMANCE_TARGETS = {
  /**
   * Maximum acceptable middleware execution time
   */
  MIDDLEWARE_EXECUTION: 50,

  /**
   * Maximum acceptable locale detection time
   */
  LOCALE_DETECTION: 10,

  /**
   * Maximum acceptable cookie parsing time
   */
  COOKIE_PARSING: 5,
} as const;

/**
 * Starts a performance timer
 *
 * Creates a timer object with the current high-resolution timestamp.
 * Use `endTimer()` to calculate the duration.
 *
 * @param name - Name/label for this timer (used in logs)
 * @returns Timer object to pass to endTimer()
 *
 * @example
 * const timer = startTimer('locale-detection');
 * // ... code to measure ...
 * const duration = endTimer(timer);
 */
export function startTimer(name: string): PerformanceTimer {
  return {
    name,
    startTime: performance.now(),
  };
}

/**
 * Ends a performance timer and calculates duration
 *
 * Calculates the elapsed time since the timer was started.
 * Returns duration in milliseconds.
 *
 * @param timer - The timer object from startTimer()
 * @returns Duration in milliseconds
 *
 * @example
 * const timer = startTimer('middleware');
 * // ... middleware logic ...
 * const duration = endTimer(timer);
 * console.log(`Middleware took ${duration}ms`);
 */
export function endTimer(timer: PerformanceTimer): number {
  const endTime = performance.now();
  const duration = endTime - timer.startTime;
  return Math.round(duration * 100) / 100; // Round to 2 decimal places
}

/**
 * Creates a complete performance measurement
 *
 * Combines timer data with additional metadata for structured logging.
 *
 * @param timer - The timer object from startTimer()
 * @returns Performance measurement object
 *
 * @example
 * const timer = startTimer('middleware');
 * // ... middleware logic ...
 * const measurement = measurePerformance(timer);
 * logger.debug('Performance', { measurement });
 */
export function measurePerformance(
  timer: PerformanceTimer,
): PerformanceMeasurement {
  const endTime = Date.now();
  const duration = endTimer(timer);
  const startTime = endTime - duration;

  return {
    name: timer.name,
    duration,
    startedAt: new Date(startTime).toISOString(),
    endedAt: new Date(endTime).toISOString(),
  };
}

/**
 * Asserts that performance meets a target threshold
 *
 * Checks if the duration is within acceptable limits.
 * Useful for performance regression testing.
 *
 * @param duration - The measured duration in milliseconds
 * @param targetMs - The target threshold in milliseconds
 * @param operationName - Name of the operation being measured (for error messages)
 * @throws Error if duration exceeds target
 *
 * @example
 * const duration = endTimer(timer);
 * assertPerformance(duration, 50, 'Middleware execution');
 * // Throws if duration > 50ms
 */
export function assertPerformance(
  duration: number,
  targetMs: number,
  operationName: string,
): void {
  if (duration > targetMs) {
    throw new Error(
      `Performance assertion failed: ${operationName} took ${duration}ms, expected < ${targetMs}ms`,
    );
  }
}

/**
 * Checks if performance meets target (non-throwing version)
 *
 * Returns boolean instead of throwing an error.
 * Useful for conditional logging or warnings.
 *
 * @param duration - The measured duration in milliseconds
 * @param targetMs - The target threshold in milliseconds
 * @returns true if duration is within target, false otherwise
 *
 * @example
 * const duration = endTimer(timer);
 * if (!checkPerformance(duration, 50)) {
 *   logger.warn('Slow middleware execution', { duration });
 * }
 */
export function checkPerformance(duration: number, targetMs: number): boolean {
  return duration <= targetMs;
}

/**
 * Formats a duration for display
 *
 * Converts milliseconds to a human-readable string.
 *
 * @param durationMs - Duration in milliseconds
 * @returns Formatted string (e.g., "42.5ms", "1.2s")
 *
 * @example
 * formatDuration(42.5) // "42.50ms"
 * formatDuration(1250) // "1.25s"
 */
export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs.toFixed(2)}ms`;
  }
  const seconds = durationMs / 1000;
  return `${seconds.toFixed(2)}s`;
}

/**
 * Performance monitor class for tracking multiple operations
 *
 * Useful for measuring nested operations or multiple stages.
 *
 * @example
 * const monitor = new PerformanceMonitor();
 * monitor.start('total');
 * monitor.start('detection');
 * // ... detection logic ...
 * monitor.end('detection');
 * monitor.start('redirect');
 * // ... redirect logic ...
 * monitor.end('redirect');
 * monitor.end('total');
 * const results = monitor.getResults();
 */
export class PerformanceMonitor {
  private timers: Map<string, PerformanceTimer> = new Map();
  private measurements: Map<string, PerformanceMeasurement> = new Map();

  /**
   * Start timing an operation
   *
   * @param name - Name of the operation
   */
  start(name: string): void {
    const timer = startTimer(name);
    this.timers.set(name, timer);
  }

  /**
   * End timing an operation
   *
   * @param name - Name of the operation (must match start() call)
   * @returns Duration in milliseconds, or undefined if timer not found
   */
  end(name: string): number | undefined {
    const timer = this.timers.get(name);
    if (!timer) {
      return undefined;
    }

    const measurement = measurePerformance(timer);
    this.measurements.set(name, measurement);
    this.timers.delete(name);

    return measurement.duration;
  }

  /**
   * Get all completed measurements
   *
   * @returns Array of performance measurements
   */
  getResults(): PerformanceMeasurement[] {
    return Array.from(this.measurements.values());
  }

  /**
   * Get a specific measurement
   *
   * @param name - Name of the operation
   * @returns Performance measurement or undefined
   */
  getResult(name: string): PerformanceMeasurement | undefined {
    return this.measurements.get(name);
  }

  /**
   * Clear all timers and measurements
   */
  clear(): void {
    this.timers.clear();
    this.measurements.clear();
  }

  /**
   * Get summary statistics
   *
   * @returns Object with total, min, max, average durations
   */
  getSummary(): {
    total: number;
    count: number;
    min: number;
    max: number;
    average: number;
  } {
    const measurements = this.getResults();
    if (measurements.length === 0) {
      return { total: 0, count: 0, min: 0, max: 0, average: 0 };
    }

    const durations = measurements.map((m) => m.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const average = total / durations.length;

    return {
      total: Math.round(total * 100) / 100,
      count: durations.length,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      average: Math.round(average * 100) / 100,
    };
  }
}
