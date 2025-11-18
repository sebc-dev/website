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
 * import \{ logger \} from '\@/lib/i18n/logger';
 *
 * logger.debug('Language detected', \{ locale: 'fr', source: 'cookie' \});
 * logger.info('Redirect performed', \{ from: '/de/', to: '/fr/' \});
 * logger.warn('Invalid cookie value', \{ value: 'invalid' \});
 * logger.error('Middleware error', \{ error: err.message \});
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
  prefix: string;
  enabled?: boolean;
  level?: LogLevel;
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
 * Determines if logging is enabled based on configuration
 *
 * Checks the config.enabled flag with a fallback to true.
 * When enabled, the log level controls what gets output (see getLogLevel()).
 *
 * @returns true if logging is enabled
 */
function isLoggingEnabled(): boolean {
  // Read from config with fallback to true (enabled by default)
  return activeConfig.enabled ?? true;
}

/**
 * Gets the minimum log level based on configuration and environment
 *
 * Prefers config.level if set, otherwise uses environment-based logic:
 * - Production: ERROR only (minimal logging)
 * - Development with DEBUG=i18n:*: DEBUG (verbose)
 * - Development without DEBUG: INFO (moderate)
 *
 * @returns The minimum log level
 */
function getLogLevel(): LogLevel {
  // Prefer explicit config level if set
  if (activeConfig.level !== undefined) {
    return activeConfig.level;
  }

  // Fall back to environment-based logic
  // Detect edge runtime where process/process.env may be unavailable
  const isEdge = typeof process === 'undefined' || !process.env;

  // Safely read environment variables with fallbacks for edge runtime
  const nodeEnv = isEdge ? 'production' : process.env.NODE_ENV || 'development';
  const debugEnv = isEdge ? '' : process.env.DEBUG || '';

  // DEBUG flag overrides environment: full debugging
  if (debugEnv.includes('i18n')) {
    return LogLevel.DEBUG;
  }

  // Production: errors only
  if (nodeEnv === 'production') {
    return LogLevel.ERROR;
  }

  // Development without DEBUG: info and above
  return LogLevel.INFO;
}

/**
 * Default logger configuration
 */
const defaultLoggerConfig: LoggerConfig = {
  prefix: 'i18n',
  enabled: true,
  level: undefined, // Let environment-based logic determine level by default
};

/**
 * Active logger configuration
 */
const activeConfig: LoggerConfig = defaultLoggerConfig;

/**
 * Logger configuration prefix
 */
const LOG_PREFIX = activeConfig.prefix;

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
  // Check logging enabled dynamically (important for tests and runtime env changes)
  if (!isLoggingEnabled()) {
    return false;
  }

  // Get current log level dynamically
  const currentLevel = getLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
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
  return `[${timestamp}] [${level.toUpperCase()}] [${LOG_PREFIX}] ${message}${dataStr}`;
}

/**
 * Internal log function that handles the actual logging
 *
 * @param level - The log level
 * @param message - The log message
 * @param data - Optional structured data (no PII)
 */
function log(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
): void {
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
 * logger.debug('Language detected', \{ locale: 'fr', source: 'cookie' \});
 * logger.info('Redirect performed', \{ from: '/de/', to: '/fr/' \});
 * logger.warn('Invalid cookie value', \{ value: 'invalid' \});
 * logger.error('Middleware error', \{ error: err.message \});
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
    return isLoggingEnabled();
  },

  /**
   * Get current log level
   *
   * @returns The current minimum log level
   */
  getLevel(): LogLevel {
    return getLogLevel();
  },
};
