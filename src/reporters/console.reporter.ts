/**
 * ConsoleReporter — Browser DevTools Output
 *
 * Delivers log entries to the browser's developer console using
 * consola's built-in formatting. Routes entries to the appropriate
 * `console.*` method based on severity level.
 *
 * This is the primary reporter for development environments.
 * Consola handles all formatting, colors, and structured object
 * display natively in the browser.
 *
 * @module @stackra/ts-logger/reporters
 *
 * @example
 * ```typescript
 * const reporter = new ConsoleReporter();
 * reporter.report(entry); // outputs to console with consola formatting
 *
 * // With custom minimum level:
 * const warnOnly = new ConsoleReporter({ level: LogLevel.Warn });
 * ```
 */

import { createConsola } from "consola/browser";
import { LogLevel } from "@stackra/contracts";
import type { ILogEntry, ILogReporter } from "@stackra/contracts";
import type { ConsoleReporterOptions } from "@/interfaces/console-reporter-options.interface";

/**
 * Map LogLevel enum values to consola's numeric log levels.
 *
 * Consola uses: 0=fatal, 1=error, 2=warn, 3=log/info, 4=debug, 5=trace/verbose
 * Our LogLevel enum: Debug=0, Info=1, Warn=2, Error=3, Fatal=4
 */
function toConsolaLevel(level: LogLevel): number {
  switch (level) {
    case LogLevel.Debug:
      return 4;
    case LogLevel.Info:
      return 3;
    case LogLevel.Warn:
      return 2;
    case LogLevel.Error:
      return 1;
    case LogLevel.Fatal:
      return 0;
    default:
      return 3;
  }
}

/**
 * ConsoleReporter — delivers log entries to the browser console via consola.
 *
 * Uses consola's browser-native formatting for clean, readable output
 * in Chrome/Firefox/Safari DevTools.
 */
export class ConsoleReporter implements ILogReporter {
  /** @inheritdoc */
  public readonly name = "console";

  /** The minimum log level threshold. */
  private _level: LogLevel;

  /** The consola instance used for output. */
  private readonly consola;

  /**
   * Create a new ConsoleReporter instance.
   *
   * @param options - Optional configuration for level and tag
   */
  public constructor(options: ConsoleReporterOptions = {}) {
    this._level = options.level ?? LogLevel.Debug;

    this.consola = createConsola({
      level: toConsolaLevel(this._level),
      defaults: {
        tag: options.tag ?? "app",
      },
    });
  }

  /**
   * Deliver a log entry to the browser console.
   *
   * Routes the entry to the appropriate consola method based on
   * the log level. Context is passed as additional arguments so
   * DevTools can expand it as a structured object.
   *
   * Entries below the configured minimum level are silently skipped.
   *
   * @param entry - The log entry to output
   */
  public report(entry: ILogEntry): void {
    if (entry.level < this._level) {
      return;
    }

    const hasContext = entry.context && Object.keys(entry.context).length > 0;

    switch (entry.level) {
      case LogLevel.Debug:
        hasContext
          ? this.consola.debug(entry.message, entry.context)
          : this.consola.debug(entry.message);
        break;
      case LogLevel.Info:
        hasContext
          ? this.consola.info(entry.message, entry.context)
          : this.consola.info(entry.message);
        break;
      case LogLevel.Warn:
        hasContext
          ? this.consola.warn(entry.message, entry.context)
          : this.consola.warn(entry.message);
        break;
      case LogLevel.Error:
        hasContext
          ? this.consola.error(entry.message, entry.context)
          : this.consola.error(entry.message);
        break;
      case LogLevel.Fatal:
        hasContext
          ? this.consola.fatal(entry.message, entry.context)
          : this.consola.fatal(entry.message);
        break;
      default:
        hasContext
          ? this.consola.log(entry.message, entry.context)
          : this.consola.log(entry.message);
    }
  }

  /**
   * No-op flush — console output is immediate.
   */
  public flush(): void {
    // Console output is synchronous, nothing to flush.
  }

  /** @inheritdoc */
  public getLevel(): LogLevel {
    return this._level;
  }

  /** @inheritdoc */
  public setLevel(level: LogLevel): void {
    this._level = level;
    this.consola.level = toConsolaLevel(level);
  }
}
