/**
 * Console Transporter
 *
 * Delivers log entries to the browser's developer console using the
 * appropriate `console.*` method for each severity level. When paired
 * with the PrettyFormatter (the default), output includes CSS-styled
 * level badges with colors and emoji prefixes.
 *
 * This is the primary transporter for development environments.
 *
 * @module transporters/console
 *
 * @example
 * ```ts
 * const transporter = new ConsoleTransporter();
 * transporter.transport(entry); // outputs to console with colors
 *
 * // With custom minimum level:
 * const warnOnly = new ConsoleTransporter({ level: LogLevel.Warn });
 * ```
 */
import { LogLevel } from '@/enums';
import { LEVEL_COLORS } from '@/constants/level-colors.constant';
import { PrettyFormatter } from '@/formatters';
import type { FormatterInterface, LogEntry, TransporterInterface } from '@/interfaces';
import type { ConsoleTransporterOptions } from '@/interfaces/console-transporter-options.interface';

/**
 * ConsoleTransporter — delivers log entries to the browser console.
 *
 * Routes entries to the appropriate `console.*` method based on severity.
 * When using `PrettyFormatter`, CSS styles are applied via `%c` placeholders.
 * Context is passed as a separate expandable object in DevTools.
 */
export class ConsoleTransporter implements TransporterInterface {
  /**
   * The formatter used to convert log entries into output strings.
   * @private
   */
  private _formatter: FormatterInterface;

  /**
   * The minimum log level threshold for this transporter.
   * @private
   */
  private _level: LogLevel;

  /**
   * Create a new ConsoleTransporter instance.
   *
   * @param options - Optional configuration for formatter and minimum level.
   */
  constructor(options: ConsoleTransporterOptions = {}) {
    this._formatter = options.formatter ?? new PrettyFormatter();
    this._level = options.level ?? LogLevel.Debug;
  }

  /**
   * Deliver a log entry to the browser console.
   *
   * Routes the entry to the appropriate `console.*` method based on
   * the log level. When using the PrettyFormatter, CSS styles are
   * applied via `%c` placeholders for colored output. Context is
   * passed as a separate object argument so DevTools can expand it.
   *
   * Entries below the configured minimum level are silently skipped.
   *
   * @param entry - The log entry to output.
   */
  public transport(entry: LogEntry): void {
    // Skip entries below the minimum level threshold.
    if (entry.level < this._level) {
      return;
    }

    const formatted = this._formatter.format(entry);
    const method = this.resolveConsoleMethod(entry.level);
    const hasContext = entry.context && Object.keys(entry.context).length > 0;

    // When using PrettyFormatter, apply CSS styles via %c placeholders.
    if (this._formatter instanceof PrettyFormatter) {
      const levelStyle = LEVEL_COLORS[entry.level];
      const resetStyle = 'color: inherit';

      if (hasContext) {
        method(formatted, levelStyle, resetStyle, entry.context);
      } else {
        method(formatted, levelStyle, resetStyle);
      }
    } else {
      if (hasContext) {
        method(formatted, entry.context);
      } else {
        method(formatted);
      }
    }
  }

  /**
   * Replace the current formatter.
   *
   * @param formatter - The new formatter instance to use.
   */
  public setFormatter(formatter: FormatterInterface): void {
    this._formatter = formatter;
  }

  /**
   * Retrieve the currently assigned formatter.
   *
   * @returns The active formatter instance.
   */
  public getFormatter(): FormatterInterface {
    return this._formatter;
  }

  /**
   * Get the minimum log level this transporter handles.
   *
   * @returns The current minimum LogLevel threshold.
   */
  public getLevel(): LogLevel {
    return this._level;
  }

  /**
   * Set the minimum log level this transporter handles.
   *
   * @param level - The new minimum LogLevel threshold.
   */
  public setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * Resolve the appropriate `console.*` method for a given log level.
   *
   * Maps logger severity levels to the closest browser console method
   * to ensure proper DevTools filtering and visual distinction.
   *
   * @param level - The log level to resolve.
   * @returns The bound console method function.
   * @private
   */
  private resolveConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.Debug:
        return console.debug.bind(console);
      case LogLevel.Info:
        return console.info.bind(console);
      case LogLevel.Warn:
        return console.warn.bind(console);
      case LogLevel.Error:
        return console.error.bind(console);
      case LogLevel.Fatal:
        return console.error.bind(console);
      default:
        return console.log.bind(console);
    }
  }
}
