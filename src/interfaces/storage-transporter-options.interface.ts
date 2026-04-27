/**
 * Storage Transporter Options Interface
 *
 * Configuration options for the `StorageTransporter`.
 * Controls the localStorage key, max entries, formatter, and minimum log level.
 *
 * @module interfaces/storage-transporter-options
 */

import type { LogLevel } from '@/enums';
import type { FormatterInterface } from './formatter.interface';

/**
 * Configuration options for the StorageTransporter.
 *
 * @example
 * ```typescript
 * const transporter = new StorageTransporter({
 *   key: 'app-logs',
 *   maxEntries: 200,
 *   level: LogLevel.Info,
 * });
 * ```
 */
export interface StorageTransporterOptions {
  /**
   * The localStorage key under which log entries are stored.
   *
   * @default "logger:entries"
   */
  key?: string;

  /**
   * Maximum number of entries to retain in storage.
   * When the limit is exceeded, the oldest entries are discarded (FIFO).
   *
   * @default 100
   */
  maxEntries?: number;

  /**
   * The formatter to use for serializing log entries.
   * Defaults to `JsonFormatter` if not provided.
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
