/**
 * Transporter Interface
 *
 * Defines the contract for log transporters (also known as handlers
 * or channels in other frameworks). A transporter receives formatted
 * log entries and delivers them to a specific destination — such as
 * the browser console, localStorage, or a remote endpoint.
 *
 * Inspired by Laravel's channel/handler pattern and Monolog's
 * HandlerInterface, simplified for client-side environments.
 *
 * @module interfaces/transporter
 *
 * @example
 * ```ts
 * class MyTransporter implements TransporterInterface {
 *   private formatter: FormatterInterface = new SimpleFormatter();
 *
 *   transport(entry: LogEntry): void {
 *     const output = this.formatter.format(entry);
 *     // deliver output to destination
 *   }
 *
 *   setFormatter(formatter: FormatterInterface): void {
 *     this.formatter = formatter;
 *   }
 *
 *   getFormatter(): FormatterInterface {
 *     return this.formatter;
 *   }
 * }
 * ```
 */
import type { LogLevel } from '@/enums';
import type { LogEntry } from './log-entry.interface';
import type { FormatterInterface } from './formatter.interface';

export interface TransporterInterface {
  /**
   * Deliver a log entry to the transport destination.
   * The transporter should use its assigned formatter to convert the
   * entry into the appropriate output format before delivery.
   *
   * @param entry - The log entry to transport.
   */
  transport(entry: LogEntry): void;

  /**
   * Replace the current formatter with a new one.
   *
   * @param formatter - The formatter instance to use for future entries.
   */
  setFormatter(formatter: FormatterInterface): void;

  /**
   * Retrieve the currently assigned formatter.
   *
   * @returns The active formatter instance.
   */
  getFormatter(): FormatterInterface;

  /**
   * Get the minimum log level this transporter will handle.
   * Entries below this level should be silently ignored.
   *
   * @returns The minimum LogLevel threshold.
   */
  getLevel(): LogLevel;

  /**
   * Set the minimum log level this transporter will handle.
   *
   * @param level - The minimum LogLevel threshold.
   */
  setLevel(level: LogLevel): void;
}
