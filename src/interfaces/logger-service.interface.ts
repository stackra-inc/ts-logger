import type { LoggerInterface } from './logger.interface';

/**
 * Logger Service Interface
 *
 * Defines the contract for logger service implementations.
 * Manages multiple logging channels.
 */
export interface LoggerServiceInterface {
  /**
   * Get a logger channel by name
   *
   * @param channelName - Channel name (uses default if not specified)
   * @returns Logger instance
   */
  channel(channelName?: string): LoggerInterface;

  /**
   * Get the default channel name
   *
   * @returns Default channel name
   */
  getDefaultChannelName(): string;

  /**
   * Get all configured channel names
   *
   * @returns Array of channel names
   */
  getChannelNames(): string[];

  /**
   * Check if a channel exists
   *
   * @param channelName - Channel name
   * @returns True if channel exists
   */
  hasChannel(channelName: string): boolean;

  /**
   * Log a debug message to default channel
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an info message to default channel
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a warning message to default channel
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an error message to default channel
   */
  error(message: string, context?: Record<string, unknown>): void;
}
