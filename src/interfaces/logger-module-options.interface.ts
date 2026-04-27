/**
 * Logger Module Configuration
 *
 * Defines the configuration interface for the logger module.
 * Supports multiple channels with different transporters and settings.
 *
 * @module config/logger
 */

import type { LoggerConfig } from '@/interfaces/logger-config.interface';

/**
 * Logger module options
 *
 * Configuration for the logger module with support for multiple channels.
 * Each channel can have its own transporters, context, and settings.
 *
 * @example
 * ```typescript
 * const config: LoggerModuleOptions = {
 *   default: 'console',
 *   channels: {
 *     console: {
 *       transporters: [new ConsoleTransporter()],
 *       context: { app: 'my-app' },
 *     },
 *     storage: {
 *       transporters: [new StorageTransporter()],
 *     },
 *     errors: {
 *       transporters: [
 *         new ConsoleTransporter({ level: LogLevel.ERROR }),
 *         new StorageTransporter({ key: 'error-logs' }),
 *       ],
 *     },
 *   },
 * };
 * ```
 */
export interface LoggerModuleOptions {
  /**
   * Default channel name
   *
   * The channel to use when no specific channel is requested.
   * Must match one of the keys in the channels object.
   */
  default: string;

  /**
   * Channel configurations
   *
   * Map of channel names to their configurations.
   * Each channel can have its own transporters and settings.
   */
  channels: Record<string, LoggerConfig>;
}
