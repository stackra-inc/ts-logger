/**
 * ReporterLoader — Auto-Discovery of @Reporter Classes
 *
 * Scans all providers in the DI container at bootstrap time, finds classes
 * decorated with `@Reporter`, and attaches them to the appropriate channels
 * on the `LoggerManager`.
 *
 * This enables external packages to contribute reporters to the logging
 * system without modifying the logger configuration. For example:
 * - A Sentry package provides `@Reporter({ name: "sentry", channels: ["errors"] })`
 * - A Datadog package provides `@Reporter({ name: "datadog" })` (all channels)
 * - An IndexedDB package provides `@Reporter({ name: "indexeddb", channels: ["audit"] })`
 *
 * ## Lifecycle
 *
 * - `onApplicationBootstrap()` — scans providers, attaches reporters to channels
 *
 * ## How It Works
 *
 * 1. Discovers all providers with `@Reporter` metadata
 * 2. Validates they implement `ILogReporter` (have a `report()` method)
 * 3. If `channels` is specified, attaches to those channels only
 * 4. If `channels` is empty/omitted, attaches to ALL configured channels
 * 5. Sets the reporter's level from the decorator options if specified
 *
 * @module @stackra/ts-logger/services
 */

import { Injectable, DiscoveryService } from "@stackra/ts-container";
import type { IOnApplicationBootstrap } from "@stackra/ts-container";
import { getMetadata } from "@vivtel/metadata";
import { REPORTER_METADATA } from "@/constants";
import { LoggerManager } from "./logger-manager.service";
import type { ILogReporter, IReporterOptions } from "@stackra/contracts";

/**
 * Discovers and attaches all `@Reporter`-decorated classes to logger channels.
 *
 * This service is internal to `LoggerModule` — you don't use it directly.
 * It runs automatically during application bootstrap.
 *
 * @example
 * ```typescript
 * // In another package (e.g., @stackra/ts-sentry):
 * @Reporter({ name: "sentry", channels: ["errors"], level: LogLevel.Error })
 * @Injectable()
 * export class SentryReporter implements ILogReporter {
 *   // Automatically attached to the "errors" channel at bootstrap
 * }
 * ```
 */
@Injectable()
export class ReporterLoader implements IOnApplicationBootstrap {
  public constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly loggerManager: LoggerManager,
  ) {}

  /**
   * Called after all modules are initialized.
   * Scans providers for `@Reporter` metadata and attaches them to channels.
   */
  public onApplicationBootstrap(): void {
    this.loadReporters();
  }

  /**
   * Scan all providers for `@Reporter`-decorated classes and attach them.
   */
  private loadReporters(): void {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || wrapper.isAlias) continue;

      const constructor = (instance as { constructor?: Function }).constructor;
      if (!constructor) continue;

      const reporterOptions = getMetadata<IReporterOptions>(
        REPORTER_METADATA,
        constructor as object,
      );

      if (!reporterOptions) continue;

      const reporter = instance as ILogReporter;

      // Validate the instance implements ILogReporter
      if (typeof reporter.report !== "function") {
        console.error(
          `[Logger] Reporter "${reporterOptions.name}" does not implement ILogReporter.report()`,
        );
        continue;
      }

      // Set the level from decorator options if specified
      if (reporterOptions.level !== undefined && typeof reporter.setLevel === "function") {
        reporter.setLevel(reporterOptions.level);
      }

      // Determine which channels to attach to
      const targetChannels =
        reporterOptions.channels && reporterOptions.channels.length > 0
          ? reporterOptions.channels
          : this.loggerManager.getChannelNames();

      // Attach the reporter to each target channel
      for (const channelName of targetChannels) {
        if (!this.loggerManager.hasChannel(channelName)) {
          console.warn(
            `[Logger] Reporter "${reporterOptions.name}" targets channel "${channelName}" which does not exist`,
          );
          continue;
        }

        const channelLogger = this.loggerManager.channel(channelName);
        const existingReporters = channelLogger.getReporters();

        // Avoid duplicate registration
        const alreadyAttached = existingReporters.some((r) => r.name === reporterOptions.name);
        if (!alreadyAttached) {
          existingReporters.push(reporter);
        }
      }
    }
  }
}
