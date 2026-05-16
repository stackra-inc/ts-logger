/**
 * Logger Manager
 *
 * The central orchestrator for the logger system. Manages multiple named
 * logging channels using the `MultipleInstanceManager` pattern from
 * `@stackra/ts-support`.
 *
 * Each channel is lazily created on first access, cached internally, and
 * reused on subsequent calls. The manager resolves channel configs and
 * wraps them in `LoggerService` instances that provide the high-level API.
 *
 * ## Architecture
 *
 * ```
 * LoggerManager (this class)
 *   ├── extends MultipleInstanceManager<LoggerConfig>
 *   ├── resolves channel configs (console, storage, silent reporters)
 *   └── wraps them in LoggerService (the consumer-facing API)
 * ```
 *
 * ## Lifecycle
 *
 * - `IOnModuleInit` — eagerly creates the default channel to catch config errors
 * - `OnModuleDestroy` — flushes all reporters and clears channels
 *
 * @module @stackra/ts-logger/services
 */

import {
  Injectable,
  Inject,
  type IOnModuleInit,
  type OnModuleDestroy,
} from "@stackra/ts-container";
import { MultipleInstanceManager, Str } from "@stackra/ts-support";
import { LOGGER_CONFIG } from "@stackra/contracts";
import type { ILoggerConfig, ILoggerModuleOptions } from "@stackra/contracts";
import { LoggerService } from "./logger.service";
import { ConsoleReporter } from "@/reporters/console.reporter";
import { SilentReporter } from "@/reporters/silent.reporter";

/**
 * LoggerManager — creates and manages multiple named logging channels.
 *
 * @example
 * ```typescript
 * // Get default channel
 * const logger = manager.channel();
 * logger.info('Hello world');
 *
 * // Get specific channel
 * const errorLogger = manager.channel('errors');
 * errorLogger.error('Something went wrong', { code: 500 });
 *
 * // Register custom driver at runtime
 * manager.extend('custom', (config) => config as LoggerConfig);
 * ```
 */
@Injectable()
export class LoggerManager
  extends MultipleInstanceManager<ILoggerConfig>
  implements IOnModuleInit, OnModuleDestroy
{
  /**
   * Cached LoggerService wrappers, keyed by channel name.
   * Separate from the base class's LoggerConfig cache — this caches
   * the high-level LoggerService wrappers that consumers interact with.
   */
  private readonly services: Map<string, LoggerService> = new Map();

  /**
   * Create a new LoggerManager instance.
   *
   * @param config - Logger module configuration (default channel, channels map)
   */
  public constructor(@Inject(LOGGER_CONFIG) private readonly config: ILoggerModuleOptions) {
    super();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Called after all providers are instantiated.
   * Eagerly creates the default channel to catch config errors early.
   * If the default channel has issues, logs a warning instead of crashing.
   */
  public onModuleInit(): void {
    try {
      this.channel();
    } catch (err: Error | unknown) {
      console.warn(
        `[LoggerManager] Failed to create default channel '${this.config.default}':`,
        (err as Error).message,
      );
    }
  }

  /**
   * Called on `app.close()`.
   * Flushes all reporters and clears internal caches.
   */
  public async onModuleDestroy(): Promise<void> {
    // Flush all reporters before clearing
    for (const [, service] of this.services) {
      for (const reporter of service.getReporters()) {
        reporter.flush?.();
      }
    }
    this.services.clear();
    this.purge();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────────

  /**
   * Get the default channel name from configuration.
   *
   * @returns The default channel name (e.g., "console", "combined")
   */
  public getDefaultInstance(): string {
    return this.config.default;
  }

  /**
   * Change the default channel at runtime.
   *
   * Subsequent calls to `channel()` without a name argument will
   * resolve to the new default. Does not affect already-resolved
   * LoggerService instances.
   *
   * @param name - The new default channel name (must exist in config)
   */
  public setDefaultInstance(name: string): void {
    (this.config as { default: string }).default = name;
  }

  /**
   * Get the configuration for a named channel.
   *
   * Adds a synthetic `driver` field so the base class can resolve it.
   * The driver name is inferred from the first reporter's class name.
   *
   * @param name - Channel name to look up
   * @returns The channel configuration with a `driver` field, or `undefined`
   */
  public getInstanceConfig(name: string): Record<string, unknown> | undefined {
    const channelConfig = this.config.channels[name];
    if (!channelConfig) return undefined;

    const driver = this.resolveDriverName(channelConfig);
    return { driver, ...channelConfig };
  }

  /**
   * Create a channel driver instance (LoggerConfig).
   *
   * Called by the base class when a channel is requested for the first time.
   * Returns the channel config with default reporters if none specified.
   *
   * @param driver - Driver name inferred from reporters
   * @param config - Raw channel configuration
   * @returns A LoggerConfig with guaranteed reporters
   */
  protected createDriver(driver: string, config: Record<string, unknown>): ILoggerConfig {
    const channelConfig = config as ILoggerConfig;

    // Ensure reporters exist — add defaults based on driver name
    if (!channelConfig.reporters || channelConfig.reporters.length === 0) {
      if (driver === "silent") {
        return { ...channelConfig, reporters: [new SilentReporter()] };
      }
      return { ...channelConfig, reporters: [new ConsoleReporter()] };
    }

    return channelConfig;
  }

  // ── Channel access ──────────────────────────────────────────────────────

  /**
   * Get a LoggerService for a named channel.
   *
   * The primary consumer API. Returns a LoggerService wrapping the
   * channel's reporters with debug, info, warn, error, fatal methods.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Channel name. Uses default if omitted.
   * @returns A LoggerService instance for the requested channel
   *
   * @example
   * ```typescript
   * const logger = manager.channel();           // default
   * const errors = manager.channel('errors');   // named
   * ```
   */
  public channel(name?: string): LoggerService {
    const channelName = name ?? this.config.default;

    const existing = this.services.get(channelName);
    if (existing) return existing;

    const channelConfig = this.instance(channelName);
    const service = new LoggerService(channelConfig);

    this.services.set(channelName, service);
    return service;
  }

  // ── Introspection ───────────────────────────────────────────────────────

  /**
   * Get all configured channel names (from config, not just active).
   *
   * @returns Array of channel names
   */
  public getChannelNames(): string[] {
    return Object.keys(this.config.channels);
  }

  /**
   * Check if a channel is configured (exists in config).
   *
   * @param name - Channel name to check
   * @returns `true` if the channel exists in configuration
   */
  public hasChannel(name: string): boolean {
    return name in this.config.channels;
  }

  /**
   * Check if a channel is currently active (cached and resolved).
   *
   * @param name - Channel name. Uses default if omitted.
   * @returns `true` if the channel has been resolved and cached
   */
  public isChannelActive(name?: string): boolean {
    const channelName = name ?? this.config.default;
    return this.services.has(channelName);
  }

  // ── Channel management ──────────────────────────────────────────────────

  /**
   * Forget a cached channel and its LoggerService wrapper.
   * Forces re-creation on next `channel()` call.
   *
   * @param name - Channel name(s). Uses default if omitted.
   * @returns This instance for chaining
   */
  public forgetChannel(name?: string | string[]): this {
    const names = name ? (Array.isArray(name) ? name : [name]) : [this.config.default];
    for (const n of names) {
      this.services.delete(n);
    }
    return this.forgetInstance(name);
  }

  /**
   * Clear all cached channels and LoggerService wrappers.
   * Forces full re-creation on next access.
   */
  public override purge(): void {
    this.services.clear();
    super.purge();
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Resolve a driver name from channel config.
   * Used to populate the synthetic `driver` field for the base class.
   *
   * @param config - The channel configuration
   * @returns A driver name string (e.g., "console", "storage", "silent")
   */
  private resolveDriverName(config: ILoggerConfig): string {
    if (!config.reporters || config.reporters.length === 0) {
      return "console";
    }
    const first = config.reporters[0]!;
    const name = Str.lower(first.constructor.name);
    if (Str.contains(name, "silent")) return "silent";
    if (Str.contains(name, "storage")) return "storage";
    return "console";
  }
}
