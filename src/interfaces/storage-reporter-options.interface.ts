/**
 * StorageReporterOptions Interface
 *
 * Configuration options for the `StorageReporter`.
 *
 * @module @stackra/ts-logger/interfaces
 */

import type { LogLevel } from "@stackra/contracts";

/**
 * Options for the StorageReporter.
 */
export interface StorageReporterOptions {
  /**
   * The localStorage key under which entries are stored.
   *
   * @default "logger:entries"
   */
  key?: string;

  /**
   * Maximum number of entries to retain.
   * When exceeded, oldest entries are removed (FIFO).
   *
   * @default 100
   */
  maxEntries?: number;

  /**
   * Minimum log level to persist. Entries below this level are discarded.
   *
   * @default LogLevel.Debug
   */
  level?: LogLevel;
}
