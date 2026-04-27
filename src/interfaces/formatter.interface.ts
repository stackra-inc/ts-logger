/**
 * Formatter Interface
 *
 * Defines the contract for log message formatters. A formatter is
 * responsible for converting a LogEntry into a presentable string
 * (or structured output) before it is handed to a transporter.
 *
 * Inspired by Monolog's FormatterInterface / Laravel's log formatting,
 * adapted for lightweight client-side usage.
 *
 * @module interfaces/formatter
 *
 * @example
 * ```ts
 * class MyFormatter implements FormatterInterface {
 *   format(entry: LogEntry): string {
 *     return `[${entry.level}] ${entry.message}`;
 *   }
 * }
 * ```
 */
import type { LogEntry } from './log-entry.interface';

export interface FormatterInterface {
  /**
   * Format a log entry into a string representation.
   *
   * @param entry - The log entry to format.
   * @returns The formatted string ready for output.
   */
  format(entry: LogEntry): string;
}
