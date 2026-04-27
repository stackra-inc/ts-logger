/**
 * Log Level Enum
 *
 * Defines the severity levels for log messages, ordered from
 * least severe (debug) to most severe (fatal). Inspired by
 * PSR-3 / Laravel logging levels, adapted for client-side use.
 *
 * Each level has a numeric value that enables level-based filtering.
 * A transporter configured with a minimum level will only process
 * messages at or above that severity.
 *
 * @module enums/log-level
 */
export enum LogLevel {
  /**
   * Detailed debug information.
   * Use for development-time diagnostics that should not appear in production.
   */
  Debug = 0,

  /**
   * Interesting events.
   * Example: User logs in, feature flag evaluated, route navigated.
   */
  Info = 1,

  /**
   * Exceptional occurrences that are not errors.
   * Example: Use of deprecated APIs, poor use of an API, recoverable issues.
   */
  Warn = 2,

  /**
   * Runtime errors that do not require immediate action but should
   * typically be logged and monitored.
   */
  Error = 3,

  /**
   * System is unusable or a critical failure has occurred.
   * Example: Unrecoverable state, data corruption detected.
   */
  Fatal = 4,
}
