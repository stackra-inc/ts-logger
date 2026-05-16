/**
 * ConsoleReporterOptions Interface
 *
 * Configuration options for the `ConsoleReporter`.
 *
 * @module @stackra/ts-logger/interfaces
 */

import type { LogLevel } from "@stackra/contracts";

/**
 * Options for the ConsoleReporter.
 */
export interface ConsoleReporterOptions {
  /**
   * Minimum log level to output. Entries below this level are discarded.
   *
   * @default LogLevel.Debug
   */
  level?: LogLevel;

  /**
   * Tag prefix shown in console output.
   * Helps identify the source application in shared DevTools.
   *
   * @default "app"
   */
  tag?: string;
}
