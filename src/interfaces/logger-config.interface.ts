/**
 * Logger Configuration Interface
 *
 * Defines the shape of configuration options accepted by the Logger
 * constructor and the LoggerManager. Provides sensible defaults so
 * consumers can create a logger with zero configuration.
 *
 * @module interfaces/logger-config
 *
 * @example
 * ```ts
 * const config: LoggerConfig = {
 *   transporters: [new ConsoleTransporter()],
 *   context: { app: 'my-app' },
 * };
 * const logger = new Logger(config);
 * ```
 */
import type { TransporterInterface } from './transporter.interface';

export interface LoggerConfig {
  /**
   * The list of transporters that will receive log entries.
   * If omitted, the logger will default to a single ConsoleTransporter.
   */
  transporters?: TransporterInterface[];

  /**
   * Initial shared context that will be merged into every log entry.
   * Useful for setting application-wide metadata such as app name,
   * environment, or version.
   *
   * @default {}
   */
  context?: Record<string, unknown>;
}
