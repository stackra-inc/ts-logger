/**
 * LoggerError — Base Error Class
 *
 * Base error class for all errors thrown by the logger package.
 * Provides a consistent error shape with a typed `code` property
 * for programmatic handling.
 *
 * @module @stackra/ts-logger/errors
 *
 * @example
 * ```typescript
 * try {
 *   manager.channel('missing');
 * } catch (error: Error | unknown) {
 *   if (error instanceof LoggerError) {
 *     console.error('Logger error:', error.code, error.message);
 *   }
 * }
 * ```
 */

/**
 * Base error class for the logger package.
 */
export class LoggerError extends Error {
  /** Error name for identification. */
  public readonly name: string = "LoggerError";

  /** Error code for programmatic handling. */
  public readonly code: string = "LOGGER_ERROR";

  /** Optional underlying cause. */
  public readonly cause?: Error;

  /**
   * Create a new LoggerError.
   *
   * @param message - Human-readable error message
   * @param cause - Optional underlying error that caused this failure
   */
  public constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;

    if (typeof (Error as { captureStackTrace?: Function }).captureStackTrace === "function") {
      (Error as { captureStackTrace: Function }).captureStackTrace(this, this.constructor);
    }
  }
}
