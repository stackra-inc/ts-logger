/**
 * SilentReporter — No-Op Output
 *
 * A no-op reporter that silently discards all log entries.
 * Useful for testing environments where log output would pollute
 * test results, or for production channels that should be disabled.
 *
 * Equivalent to Laravel's "null" log driver.
 *
 * @module @stackra/ts-logger/reporters
 *
 * @example
 * ```typescript
 * const reporter = new SilentReporter();
 * reporter.report(entry); // silently discarded
 * ```
 */

import { LogLevel } from "@stackra/contracts";
import type { ILogEntry, ILogReporter } from "@stackra/contracts";

/**
 * SilentReporter — discards all log entries.
 *
 * Maintains interface compliance but performs no output.
 * Use for testing or disabled channels.
 */
export class SilentReporter implements ILogReporter {
  /** @inheritdoc */
  public readonly name = "silent";

  /** The minimum log level (maintained for interface compliance). */
  private _level: LogLevel = LogLevel.Debug;

  /**
   * No-op report method. Silently discards the entry.
   *
   * @param _entry - The log entry (ignored)
   */
  public report(_entry: ILogEntry): void {
    // Intentionally empty — this reporter discards all entries.
  }

  /**
   * No-op flush.
   */
  public flush(): void {
    // Nothing to flush.
  }

  /** @inheritdoc */
  public getLevel(): LogLevel {
    return this._level;
  }

  /** @inheritdoc */
  public setLevel(level: LogLevel): void {
    this._level = level;
  }
}
