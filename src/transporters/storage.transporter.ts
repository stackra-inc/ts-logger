/**
 * Storage Transporter
 *
 * Persists log entries to the browser's localStorage as JSON strings.
 * Useful for capturing logs that survive page reloads, enabling
 * post-mortem debugging or user-submitted bug reports that include
 * recent log history.
 *
 * Entries are stored as a JSON array under a configurable storage key.
 * A maximum entry limit prevents unbounded storage growth.
 *
 * @module transporters/storage
 *
 * @example
 * ```ts
 * const transporter = new StorageTransporter({
 *   key: 'app-logs',
 *   maxEntries: 200,
 * });
 * ```
 */
import { LogLevel } from '@/enums';
import { JsonFormatter } from '@/formatters';
import type { FormatterInterface, LogEntry, TransporterInterface } from '@/interfaces';
import type { StorageTransporterOptions } from '@/interfaces/storage-transporter-options.interface';

/**
 * Default localStorage key for log storage.
 * @private
 */
const DEFAULT_STORAGE_KEY = 'logger:entries';

/**
Default maximum number of retained entries. */
const DEFAULT_MAX_ENTRIES = 100;

export class StorageTransporter implements TransporterInterface {
  /**
The formatter used to convert log entries into storable strings. */
  private _formatter: FormatterInterface;

  /**
The minimum log level threshold for this transporter. */
  private _level: LogLevel;

  /**
The localStorage key for persisting entries. */
  private readonly _key: string;

  /**
Maximum number of entries to retain. */
  private readonly _maxEntries: number;

  /**
   * Create a new StorageTransporter instance.
   *
   * @param options - Optional configuration for storage key, limits, and formatter.
   */
  constructor(options: StorageTransporterOptions = {}) {
    this._formatter = options.formatter ?? new JsonFormatter();
    this._level = options.level ?? LogLevel.Debug;
    this._key = options.key ?? DEFAULT_STORAGE_KEY;
    this._maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  /**
   * Persist a log entry to localStorage.
   *
   * The entry is formatted, appended to the existing entries array,
   * and trimmed to the maximum entry limit. If localStorage is
   * unavailable or full, the error is silently swallowed to avoid
   * crashing the application.
   *
   * @param entry - The log entry to persist.
   */
  transport(entry: LogEntry): void {
    // Skip entries below the minimum level threshold.
    if (entry.level < this._level) {
      return;
    }

    try {
      const formatted = this._formatter.format(entry);
      const entries = this.readEntries();

      entries.push(formatted);

      // Trim oldest entries when the limit is exceeded.
      while (entries.length > this._maxEntries) {
        entries.shift();
      }

      localStorage.setItem(this._key, JSON.stringify(entries));
    } catch {
      // Silently swallow storage errors (quota exceeded, unavailable, etc.)
      // to prevent logging from crashing the application.
    }
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
   * Get the minimum log level this transporter handles.
   *
   * @returns The current minimum LogLevel threshold.
   */
  getLevel(): LogLevel {
    return this._level;
  }

  /**
   * Set the minimum log level this transporter handles.
   *
   * @param level - The new minimum LogLevel threshold.
   */
  setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * Clear all stored log entries from localStorage.
   * Useful for manual cleanup or when resetting application state.
   */
  clear(): void {
    try {
      localStorage.removeItem(this._key);
    } catch {
      // Silently swallow if localStorage is unavailable.
    }
  }

  /**
   * Retrieve all stored log entries from localStorage.
   *
   * @returns An array of formatted log entry strings.
   */
  getEntries(): string[] {
    return this.readEntries();
  }

  /**
   * Read the current entries array from localStorage.
   * Returns an empty array if the key does not exist or parsing fails.
   *
   * @returns The parsed entries array.
   */
  private readEntries(): string[] {
    try {
      const raw = localStorage.getItem(this._key);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
