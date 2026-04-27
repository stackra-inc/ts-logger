/**
 * Pretty Formatter
 *
 * A visually rich formatter that produces colorful, emoji-prefixed
 * log output designed for the browser console. Each log level is
 * assigned a distinct emoji and CSS color to make scanning logs
 * effortless during development.
 *
 * This is the default formatter used by the ConsoleTransporter.
 *
 * @module formatters/pretty
 *
 * @example
 * ```ts
 * const formatter = new PrettyFormatter();
 * const output = formatter.format(entry);
 * // => "🐛 [DEBUG] [14:30:00.000] Hello world {userId: 42}"
 * ```
 */
import { Str } from '@stackra/ts-support';
import { LogLevel } from '@/enums';
import type { FormatterInterface, LogEntry } from '@/interfaces';

/**
 * Mapping of log levels to their emoji prefix.
 * Provides instant visual identification of severity in console output.
 *
 * @private
 */
const LEVEL_EMOJI: Record<LogLevel, string> = {
  [LogLevel.Debug]: '🐛',
  [LogLevel.Info]: 'ℹ️',
  [LogLevel.Warn]: '⚠️',
  [LogLevel.Error]: '❌',
  [LogLevel.Fatal]: '💀',
};

/**
 * Mapping of log levels to their display label.
 * Used in the formatted output string between brackets.
 *
 * @private
 */
const LEVEL_LABEL: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warn]: 'WARN',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
};

export class PrettyFormatter implements FormatterInterface {
  /**
   * Format a log entry into a pretty, human-readable string with
   * emoji prefix, level badge, timestamp, message, and context.
   *
   * The returned string includes `%c` placeholders for CSS styling
   * in the browser console. The ConsoleTransporter is responsible
   * for passing the corresponding style strings.
   *
   * @param entry - The log entry to format.
   * @returns The formatted string with CSS style placeholders.
   */
  format(entry: LogEntry): string {
    const emoji = LEVEL_EMOJI[entry.level];
    const label = LEVEL_LABEL[entry.level];
    const time = this.formatTimestamp(entry.timestamp);

    return `${emoji} %c[${label}]%c [${time}] ${entry.message}`;
  }

  /**
   * Extract a short time string (HH:mm:ss.SSS) from an ISO timestamp.
   *
   * @param timestamp - ISO 8601 timestamp string.
   * @returns A short time-only representation.
   */
  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const hours = Str.padLeft(String(date.getHours()), 2, '0');
      const minutes = Str.padLeft(String(date.getMinutes()), 2, '0');
      const seconds = Str.padLeft(String(date.getSeconds()), 2, '0');
      const ms = Str.padLeft(String(date.getMilliseconds()), 3, '0');

      return `${hours}:${minutes}:${seconds}.${ms}`;
    } catch {
      return timestamp;
    }
  }
}
