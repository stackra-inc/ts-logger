/**
 * Console Transporter Options Interface
 *
 * Configuration options for the `ConsoleTransporter`.
 * Controls the formatter and minimum log level threshold.
 *
 * @module interfaces/console-transporter-options
 */

import type { LogLevel } from '@/enums';
import type { FormatterInterface } from './formatter.interface';

/**
 * Configuration options for the ConsoleTransporter.
 *
 * @example
 * ```typescript
 * const transporter = new ConsoleTransporter({
 *   formatter: new PrettyFormatter(),
 *   level: LogLevel.Warn,
 * });
 * ```
 */
export interface ConsoleTransporterOptions {
  /**
   * The formatter to use for log entries.
   * Defaults to `PrettyFormatter` if not provided.
   */
  formatter?: FormatterInterface;

  /**
   * The minimum log level to transport.
   * Entries below this level are silently ignored.
   *
   * @default LogLevel.Debug
   */
  level?: LogLevel;
}
