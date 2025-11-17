/**
 * Debug logging utility for i18n middleware
 *
 * Provides structured, conditional logging for middleware operations.
 * Logging is controlled by environment flags:
 * - `DEBUG=i18n:*` - Enable debug logs (development)
 * - `NODE_ENV=production` - Minimal logging only (production)
 *
 * Log format is structured with timestamp, level, and message.
 * No Personally Identifiable Information (PII) is logged.
 *
 * @example
 * import { logger } from '@/lib/i18n/logger';
 *
 * logger.debug('Language detected', { locale: 'fr', source: 'cookie' });
 * logger.info('Redirect performed', { from: '/de/', to: '/fr/' });
 * logger.warn('Invalid cookie value', { value: 'invalid' });
 * logger.error('Middleware error', { error: err.message });
 */

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Determines if logging is enabled based on environment variables
 *
 * Logging is enabled if:
 * - DEBUG environment variable contains 'i18n' (e.g., DEBUG=i18n:* or DEBUG=i18n:middleware)
 * - NODE_ENV is not 'production'
 *
 * In production, only error logs are shown (controlled by level check).
 *
 * @returns true if logging should be enabled
 */
function isLoggingEnabled(): boolean {
  // Check DEBUG environment variable
  const debugEnv = process.env.DEBUG || '';
  if (debugEnv.includes('i18n')) {
    return true;
  }

  // Enable logging in development mode
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv !== 'production') {
    return true;
  }

  // Disable logging in production by default
  return false;
}

/**
 * Gets the minimum log level based on environment
 *
 * - Production: ERROR only (minimal logging)
 * - Development with DEBUG=i18n:*: DEBUG (verbose)
 * - Development without DEBUG: INFO (moderate)
 *
 * @returns The minimum log level
 */
function getLogLevel(): LogLevel {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const debugEnv = process.env.DEBUG || '';

  // Production: errors only
  if (nodeEnv === 'production') {
    return LogLevel.ERROR;
  }

  // Development with DEBUG flag: full debugging
  if (debugEnv.includes('i18n')) {
    return LogLevel.DEBUG;
  }

  // Development without DEBUG: info and above
  return LogLevel.INFO;
}

/**
 * Logger configuration singleton
 */
const config: LoggerConfig = {
  enabled: isLoggingEnabled(),
  level: getLogLevel(),
  prefix: 'i18n',
};

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Checks if a log level should be logged based on configuration
 *
 * @param level - The log level to check
 * @returns true if the log should be output
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) {
    return false;
  }

  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.level];
}

/**
 * Formats a log entry as a structured string
 *
 * Format: [timestamp] [level] [prefix] message data
 *
 * @param entry - The log entry to format
 * @returns Formatted log string
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, data } = entry;
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${config.prefix}] ${message}${dataStr}`;
}

/**
 * Internal log function that handles the actual logging
 *
 * @param level - The log level
 * @param message - The log message
 * @param data - Optional structured data (no PII)
 */
function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  const formatted = formatLogEntry(entry);

  // Output to appropriate console method based on level
  switch (level) {
    case LogLevel.DEBUG:
       
      console.debug(formatted);
      break;
    case LogLevel.INFO:
       
      console.info(formatted);
      break;
    case LogLevel.WARN:
       
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
       
      console.error(formatted);
      break;
  }
}

/**
 * Logger object with level methods
 *
 * Provides structured logging with different severity levels.
 * All methods accept a message and optional data object.
 *
 * @example
 * logger.debug('Language detected', { locale: 'fr', source: 'cookie' });
 * logger.info('Redirect performed', { from: '/de/', to: '/fr/' });
 * logger.warn('Invalid cookie value', { value: 'invalid' });
 * logger.error('Middleware error', { error: err.message });
 */
export const logger = {
  /**
   * Debug log (verbose, development only)
   *
   * Use for detailed troubleshooting information.
   * Only shown when DEBUG=i18n:* is set.
   *
   * @param message - The log message
   * @param data - Optional structured data
   */
  debug(message: string, data?: Record<string, unknown>): void {
    log(LogLevel.DEBUG, message, data);
  },

  /**
   * Info log (moderate verbosity)
   *
   * Use for general operational information.
   * Shown in development mode by default.
   *
   * @param message - The log message
   * @param data - Optional structured data
   */
  info(message: string, data?: Record<string, unknown>): void {
    log(LogLevel.INFO, message, data);
  },

  /**
   * Warning log (potential issues)
   *
   * Use for recoverable errors or unexpected conditions.
   * Always shown in development.
   *
   * @param message - The log message
   * @param data - Optional structured data
   */
  warn(message: string, data?: Record<string, unknown>): void {
    log(LogLevel.WARN, message, data);
  },

  /**
   * Error log (critical issues)
   *
   * Use for errors that require attention.
   * Always shown, even in production.
   *
   * @param message - The log message
   * @param data - Optional structured data
   */
  error(message: string, data?: Record<string, unknown>): void {
    log(LogLevel.ERROR, message, data);
  },

  /**
   * Check if logging is currently enabled
   *
   * @returns true if logging is enabled
   */
  isEnabled(): boolean {
    return config.enabled;
  },

  /**
   * Get current log level
   *
   * @returns The current minimum log level
   */
  getLevel(): LogLevel {
    return config.level;
  },
};
