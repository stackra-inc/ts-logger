/**
 * Logger Interface
 *
 * Defines the public contract for the Logger. Consumers should
 * depend on this interface rather than the concrete Logger class
 * to enable easy testing and substitution.
 *
 * Follows PSR-3 / Laravel conventions with log level methods,
 * contextual logging (withContext / withoutContext), and
 * transporter management.
 *
 * @module interfaces/logger
 */
import type { TransporterInterface } from './transporter.interface';

export interface LoggerInterface {
  /**
   * Log a message at the debug level.
   *
   * @param message - The log message.
   * @param context - Optional contextual data for this single entry.
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a message at the info level.
   *
   * @param message - The log message.
   * @param context - Optional contextual data for this single entry.
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a message at the warn level.
   *
   * @param message - The log message.
   * @param context - Optional contextual data for this single entry.
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a message at the error level.
   *
   * @param message - The log message.
   * @param context - Optional contextual data for this single entry.
   */
  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a message at the fatal level.
   *
   * @param message - The log message.
   * @param context - Optional contextual data for this single entry.
   */
  fatal(message: string, context?: Record<string, unknown>): void;

  /**
   * Add persistent context that will be merged into every future log entry.
   * Calling this multiple times merges new keys into the existing context.
   *
   * Inspired by Laravel's `Logger::withContext()`.
   *
   * @param context - Key-value pairs to add to the shared context.
   * @returns The logger instance for fluent chaining.
   */
  withContext(context: Record<string, unknown>): this;

  /**
   * Remove keys from the shared context, or clear it entirely.
   *
   * When called with an array of keys, only those keys are removed.
   * When called without arguments, the entire shared context is flushed.
   *
   * Inspired by Laravel's `Logger::withoutContext()`.
   *
   * @param keys - Optional array of context keys to remove.
   * @returns The logger instance for fluent chaining.
   */
  withoutContext(keys?: string[]): this;

  /**
   * Retrieve all currently registered transporters.
   *
   * @returns An array of active transporter instances.
   */
  getTransporters(): TransporterInterface[];
}
