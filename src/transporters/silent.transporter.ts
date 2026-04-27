/**
 * Silent Transporter
 *
 * A no-op transporter that silently discards all log entries.
 * Useful for production environments where logging should be
 * disabled, or for testing scenarios where log output would
 * pollute test results.
 *
 * Equivalent to Laravel's "null" log driver.
 *
 * @module transporters/silent
 *
 * @example
 * ```ts
 * const logger = new Logger({
 *   transporters: [new SilentTransporter()],
 * });
 * logger.info('This will be silently discarded');
 * ```
 */
import { LogLevel } from '@/enums';
import { SimpleFormatter } from '@/formatters';
import type { FormatterInterface, LogEntry, TransporterInterface } from '@/interfaces';

export class SilentTransporter implements TransporterInterface {
  /**
The formatter instance (maintained for interface compliance). */
  private _formatter: FormatterInterface;

  /**
The minimum log level (maintained for interface compliance). */
  private _level: LogLevel;

  /**
   * Create a new SilentTransporter instance.
   * All parameters are optional and exist only for interface compliance.
   */
  constructor() {
    this._formatter = new SimpleFormatter();
    this._level = LogLevel.Debug;
  }

  /**
   * No-op transport method. Silently discards the entry.
   *
   * @param _entry - The log entry (ignored).
   */
  transport(_entry: LogEntry): void {
    // Intentionally empty — this transporter discards all entries.
  }

  /**
   * Replace the current formatter.
   *
   * @param formatter - The new formatter instance.
   */
  setFormatter(formatter: FormatterInterface): void {
    this._formatter = formatter;
  }

  /**
   * Retrieve the currently assigned formatter.
   *
   * @returns The active formatter instance.
   */
  getFormatter(): FormatterInterface {
    return this._formatter;
  }

  /**
   * Get the minimum log level.
   *
   * @returns The current minimum LogLevel threshold.
   */
  getLevel(): LogLevel {
    return this._level;
  }

  /**
   * Set the minimum log level.
   *
   * @param level - The new minimum LogLevel threshold.
   */
  setLevel(level: LogLevel): void {
    this._level = level;
  }
}
