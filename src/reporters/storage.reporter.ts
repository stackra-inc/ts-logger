/**
 * StorageReporter — localStorage Persistence
 *
 * Persists log entries to the browser's localStorage as JSON strings.
 * Useful for capturing logs that survive page reloads, enabling
 * post-mortem debugging or user-submitted bug reports that include
 * recent log history.
 *
 * Entries are stored as a JSON array under a configurable storage key.
 * A maximum entry limit prevents unbounded storage growth.
 *
 * @module @stackra/ts-logger/reporters
 *
 * @example
 * ```typescript
 * const reporter = new StorageReporter({
 *   key: "app-logs",
 *   maxEntries: 200,
 * });
 * ```
 */

import { LogLevel } from "@stackra/contracts";
import type { ILogEntry, ILogReporter } from "@stackra/contracts";
import type { StorageReporterOptions } from "@/interfaces/storage-reporter-options.interface";

/**
 * StorageReporter — persists log entries to localStorage.
 *
 * Stores entries as a JSON array. Automatically trims oldest entries
 * when the maximum is exceeded. Silently swallows storage errors
 * (quota exceeded, unavailable) to prevent logging from crashing
 * the application.
 */
export class StorageReporter implements ILogReporter {
  /** @inheritdoc */
  public readonly name = "storage";

  /** The minimum log level threshold. */
  private _level: LogLevel;

  /** The localStorage key for persisting entries. */
  private readonly _key: string;

  /** Maximum number of entries to retain. */
  private readonly _maxEntries: number;

  /**
   * Create a new StorageReporter instance.
   *
   * @param options - Optional configuration for storage key, limits, and level
   */
  public constructor(options: StorageReporterOptions = {}) {
    this._level = options.level ?? LogLevel.Debug;
    this._key = options.key ?? "logger:entries";
    this._maxEntries = options.maxEntries ?? 100;
  }

  /**
   * Persist a log entry to localStorage.
   *
   * The entry is serialized as JSON, appended to the existing entries
   * array, and trimmed to the maximum entry limit. If localStorage is
   * unavailable or full, the error is silently swallowed.
   *
   * @param entry - The log entry to persist
   */
  public report(entry: ILogEntry): void {
    if (entry.level < this._level) {
      return;
    }

    try {
      const entries = this.readEntries();

      entries.push(entry);

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
   * No-op flush — localStorage writes are synchronous.
   */
  public flush(): void {
    // localStorage writes are synchronous, nothing to flush.
  }

  /** @inheritdoc */
  public getLevel(): LogLevel {
    return this._level;
  }

  /** @inheritdoc */
  public setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * Clear all stored log entries from localStorage.
   * Useful for manual cleanup or when resetting application state.
   */
  public clear(): void {
    try {
      localStorage.removeItem(this._key);
    } catch {
      // Silently swallow if localStorage is unavailable.
    }
  }

  /**
   * Retrieve all stored log entries from localStorage.
   *
   * @returns An array of stored ILogEntry objects
   */
  public getEntries(): ILogEntry[] {
    return this.readEntries();
  }

  /**
   * Read the current entries array from localStorage.
   * Returns an empty array if the key does not exist or parsing fails.
   *
   * @returns The parsed entries array
   */
  private readEntries(): ILogEntry[] {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
