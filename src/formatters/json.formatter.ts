/**
 * JSON Formatter
 *
 * Serializes log entries into compact JSON strings. Ideal for
 * structured logging scenarios where logs need to be parsed
 * programmatically — for example, when sending logs to a remote
 * endpoint or storing them in localStorage for later analysis.
 *
 * @module formatters/json
 *
 * @example
 * ```ts
 * const formatter = new JsonFormatter();
 * const output = formatter.format(entry);
 * // => '{"level":"info","message":"User logged in","timestamp":"...","context":{"userId":42}}'
 * ```
 */
import { LogLevel } from '@/enums';
import type { FormatterInterface, LogEntry } from '@/interfaces';

/**
 * Mapping of log levels to their lowercase string representation
 * for JSON output.
 */
const LEVEL_STRING: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'debug',
  [LogLevel.Info]: 'info',
  [LogLevel.Warn]: 'warn',
  [LogLevel.Error]: 'error',
  [LogLevel.Fatal]: 'fatal',
};

export class JsonFormatter implements FormatterInterface {
  /**
   * Format a log entry as a JSON string.
   *
   * Produces a flat JSON object with level (as string), message,
   * timestamp, and context fields. Context is omitted when empty
   * to keep output compact.
   *
   * @param entry - The log entry to format.
   * @returns A JSON-serialized string representation of the entry.
   */
  format(entry: LogEntry): string {
    const payload: Record<string, unknown> = {
      level: LEVEL_STRING[entry.level],
      message: entry.message,
      timestamp: entry.timestamp,
    };

    // Only include context when it has keys to keep JSON compact.
    if (Object.keys(entry.context).length > 0) {
      payload.context = entry.context;
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return JSON.stringify({
        level: LEVEL_STRING[entry.level],
        message: entry.message,
        timestamp: entry.timestamp,
        error: 'context serialization failed',
      });
    }
  }
}
