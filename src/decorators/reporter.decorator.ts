/**
 * @Reporter Decorator
 *
 * Class decorator that marks an `@Injectable()` class as a log reporter
 * for auto-discovery. The `ReporterLoader` discovers these at bootstrap
 * time and attaches them to the specified channels (or all channels if
 * none are specified).
 *
 * This enables external packages to contribute reporters to the logging
 * system without modifying the logger configuration. For example, a
 * Sentry package can provide a `@Reporter({ name: "sentry" })` class
 * that automatically captures errors.
 *
 * @module @stackra/ts-logger/decorators
 *
 * @example
 * ```typescript
 * import { Injectable } from "@stackra/ts-container";
 * import { Reporter } from "@stackra/ts-logger";
 * import type { ILogReporter, LogEntry } from "@stackra/ts-logger";
 * import { LogLevel } from "@stackra/contracts";
 *
 * @Reporter({ name: "sentry", channels: ["errors"], level: LogLevel.Error })
 * @Injectable()
 * export class SentryReporter implements ILogReporter {
 *   public readonly name = "sentry";
 *   private _level = LogLevel.Error;
 *
 *   public report(entry: LogEntry): void {
 *     if (entry.level < this._level) return;
 *     Sentry.captureMessage(entry.message, {
 *       level: this.mapLevel(entry.level),
 *       extra: entry.context,
 *     });
 *   }
 *
 *   public getLevel(): LogLevel { return this._level; }
 *   public setLevel(level: LogLevel): void { this._level = level; }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Attach to ALL channels (omit `channels`)
 * @Reporter({ name: "datadog" })
 * @Injectable()
 * export class DatadogReporter implements ILogReporter {
 *   // ...
 * }
 * ```
 */

import { defineMetadata } from "@vivtel/metadata";
import { REPORTER_METADATA } from "@/constants";
import type { IReporterOptions } from "@stackra/contracts";

/**
 * Marks a class as a log reporter for auto-discovery.
 *
 * The decorated class must implement `ILogReporter` and be decorated
 * with `@Injectable()`. At bootstrap, the `ReporterLoader` will:
 * 1. Discover all classes with this decorator
 * 2. Attach the reporter to the specified channels (or all channels)
 *
 * @param options - Reporter configuration (name is required)
 * @returns A class decorator
 */
export function Reporter(options: IReporterOptions): ClassDecorator {
  return (target: object) => {
    defineMetadata(REPORTER_METADATA, options, target);
  };
}
