/**
 * Logger Manager
 *
 * The central orchestrator for the logger system. Manages multiple named
 * logging channels using the `MultipleInstanceManager` pattern.
 *
 * Each channel is lazily created on first access, cached internally, and
 * reused on subsequent calls. The manager creates low-level `LoggerConfig`
 * driver instances and wraps them in `LoggerService` instances that
 * provide the high-level logging API.
 *
 * ## Architecture
 *
 * ```
 * LoggerManager (this class)
 *   ├── extends MultipleInstanceManager<LoggerConfig>
 *   ├── resolves channel configs (console, storage, silent transporters)
 *   └── wraps them in LoggerService (the consumer-facing API)
 * ```
 *
 * ## Lifecycle
 *
 * - `OnModuleInit` — eagerly creates the default channel
 * - `OnModuleDestroy` — clears all channels and releases resources
 *
 * @module services/logger-manager
 */

import { Injectable, Inject, type OnModuleInit, type OnModuleDestroy } from '@stackra/ts-container';
import { MultipleInstanceManager, Str } from '@stackra/ts-support';

import type { LoggerConfig } from '@/interfaces/logger-config.interface';
import type { LoggerModuleOptions } from '@/interfaces/logger-module-options.interface';
import { LoggerService } from './logger.service';
import { LOGGER_CONFIG } from '@/constants/tokens.constant';
import { ConsoleTransporter } from '@/transporters/console.transporter';
import { SilentTransporter } from '@/transporters/silent.transporter';

/**
 * LoggerManager — creates and manages multiple named logging channels.
 *
 * @example
 * ```typescript
 * // Get default channel service
 * const logger = manager.channel();
 * logger.info('Hello world');
 *
 * // Get specific channel service
 * const errorLogger = manager.channel('errors');
 * errorLogger.error('Something went wrong');
 *
 * // Register custom driver
 * manager.extend('custom', (config) => config as LoggerConfig);
 * ```
 */
@Injectable()
export class LoggerManager
  extends MultipleInstanceManager<LoggerConfig>
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Cached LoggerService wrappers, keyed by channel name.
   * Separate from the base class's LoggerConfig cache — this caches
   * the high-level LoggerService wrappers.
   */
  private readonly services: Map<string, LoggerService> = new Map();

  constructor(@Inject(LOGGER_CONFIG) private readonly config: LoggerModuleOptions) {
    super();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Called after all providers are instantiated.
   * Eagerly creates the default channel to catch config errors early.
   */
  onModuleInit(): void {
    try {
      this.channel();
    } catch (err) {
      console.warn(
        `[LoggerManager] Failed to create default channel '${this.config.default}':`,
        (err as Error).message
      );
    }
  }

  /**
   * Called on `app.close()`.
   * Clears all channels and releases resources.
   */
  async onModuleDestroy(): Promise<void> {
    this.services.clear();
    this.purge();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────────

  /** Get the default channel name from config. */
  getDefaultInstance(): string {
    return this.config.default;
  }

  /** Change the default channel at runtime. */
  setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  /**
   * Get the configuration for a named channel.
   * Adds a synthetic `driver` field so the base class can resolve it.
   */
  getInstanceConfig(name: string): Record<string, any> | undefined {
    const channelConfig = this.config.channels[name];
    if (!channelConfig) return undefined;

    // Determine driver name from transporters for extensibility
    const driver = this.resolveDriverName(channelConfig);
    return { driver, ...channelConfig };
  }

  /**
   * Create a channel driver instance (LoggerConfig).
   *
   * Called by the base class when a channel is requested for the first time.
   * Returns the channel config with default transporters if none specified.
   */
  protected createDriver(driver: string, config: Record<string, any>): LoggerConfig {
    const channelConfig = config as LoggerConfig;

    // Ensure transporters exist — add defaults based on driver name
    if (!channelConfig.transporters || channelConfig.transporters.length === 0) {
      if (driver === 'silent') {
        return { ...channelConfig, transporters: [new SilentTransporter()] };
      }
      return { ...channelConfig, transporters: [new ConsoleTransporter()] };
    }

    return channelConfig;
  }

  // ── Channel access ──────────────────────────────────────────────────────

  /**
   * Get a LoggerService for a named channel.
   *
   * The primary consumer API. Returns a LoggerService wrapping the
   * channel's transporters with debug, info, warn, error, fatal, etc.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Channel name. Uses default if omitted.
   */
  channel(name?: string): LoggerService {
    const channelName = name ?? this.config.default;

    const existing = this.services.get(channelName);
    if (existing) return existing;

    const channelConfig = this.instance(channelName);
    const service = new LoggerService(channelConfig);

    this.services.set(channelName, service);
    return service;
  }

  // ── Introspection ───────────────────────────────────────────────────────

  /** Get the default channel name. */
  getDefaultChannelName(): string {
    return this.config.default;
  }

  /** Get all configured channel names (from config, not just active). */
  getChannelNames(): string[] {
    return Object.keys(this.config.channels);
  }

  /** Check if a channel is configured (exists in config). */
  hasChannel(name: string): boolean {
    return name in this.config.channels;
  }

  /** Check if a channel is currently active (cached). */
  isChannelActive(name?: string): boolean {
    const channelName = name ?? this.config.default;
    return this.services.has(channelName);
  }

  // ── Channel management ──────────────────────────────────────────────────

  /**
   * Forget a cached channel and its LoggerService wrapper.
   * Forces re-creation on next `channel()` call.
   */
  forgetChannel(name?: string | string[]): this {
    const names = name ? (Array.isArray(name) ? name : [name]) : [this.config.default];
    for (const n of names) {
      this.services.delete(n);
    }
    return this.forgetInstance(name);
  }

  /** Clear all cached channels and LoggerService wrappers. */
  override purge(): void {
    this.services.clear();
    super.purge();
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Resolve a driver name from channel config.
   * Used to populate the synthetic `driver` field for the base class.
   */
  private resolveDriverName(config: LoggerConfig): string {
    if (!config.transporters || config.transporters.length === 0) {
      return 'console';
    }
    // Use the first transporter's class name as a hint
    const first = config.transporters[0]!;
    const name = Str.lower(first.constructor.name);
    if (Str.contains(name, 'silent')) return 'silent';
    if (Str.contains(name, 'storage')) return 'storage';
    return 'console';
  }
}
