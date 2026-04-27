/**
 * Simple Formatter
 *
 * A minimal, no-frills formatter that produces plain text log lines
 * without colors, emojis, or CSS styling. Suitable for environments
 * where styled output is not supported or when logs need to be
 * stored as plain text.
 *
 * @module formatters/simple
 *
 * @example
 * ```ts
 * const formatter = new SimpleFormatter();
 * const output = formatter.format(entry);
 * // => "[DEBUG] [2026-03-28T14:30:00.000Z] Hello world {userId: 42}"
 * ```
 */
import { LogLevel } from '@/enums';
import type { FormatterInterface, LogEntry } from '@/interfaces';

/**
 * Mapping of log levels to their uppercase string label.
 */
const LEVEL_LABEL: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warn]: 'WARN',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
};

export class SimpleFormatter implements FormatterInterface {
  /**
   * Format a log entry into a plain text line.
   *
   * Output pattern: `[LEVEL] [timestamp] message {context}`
   *
   * @param entry - The log entry to format.
   * @returns A plain text string with no styling.
   */
  format(entry: LogEntry): string {
    const label = LEVEL_LABEL[entry.level];
    const contextStr = this.formatContext(entry.context);

    return `[${label}] [${entry.timestamp}] ${entry.message}${contextStr}`;
  }

  /**
   * Serialize context data into a compact string.
   * Returns an empty string when context is empty.
   *
   * @param context - The context record to serialize.
   * @returns A formatted context string or empty string.
   */
  private formatContext(context: Record<string, unknown>): string {
    const keys = Object.keys(context);

    if (keys.length === 0) {
      return '';
    }

    try {
      return ` ${JSON.stringify(context)}`;
    } catch {
      return ' [context serialization failed]';
    }
  }
}
