/**
 * Log Entry Interface
 *
 * Represents a single log message with all associated metadata.
 * This is the core data structure that flows through formatters
 * and transporters. Every log call produces one LogEntry.
 *
 * @module interfaces/log-entry
 */
import type { LogLevel } from '@/enums';

export interface LogEntry {
  /**
   * The severity level of this log entry.
   * Determines how the message is displayed and whether it passes
   * the transporter's minimum level filter.
   */
  level: LogLevel;

  /**
   * The human-readable log message.
   * May contain interpolation placeholders depending on the formatter.
   */
  message: string;

  /**
   * ISO 8601 timestamp of when the log entry was created.
   * Automatically set by the Logger at the time of the log call.
   *
   * @example "2026-03-28T14:30:00.000Z"
   */
  timestamp: string;

  /**
   * Contextual data attached to this log entry.
   * Merged from the logger's shared context and any per-call context.
   * Useful for structured logging (e.g., user ID, request ID, component name).
   */
  context: Record<string, unknown>;
}
