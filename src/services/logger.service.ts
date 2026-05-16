/**
 * Logger Service
 *
 * The high-level API that consumers interact with. Supports two modes:
 *
 * - **Config Mode**: Wraps a channel's reporters and provides convenience
 *   methods (debug, info, warn, error, fatal). Created by LoggerManager.channel().
 *
 * - **Facade Mode**: Delegates log calls to the default channel resolved from
 *   a static LoggerManager reference. Allows `new Logger('MyService')` usage
 *   without dependency injection — safe for utilities and module-level constants.
 *
 * ## Usage Patterns
 *
 * ```typescript
 * // Facade mode — anywhere, no DI needed
 * const logger = new Logger('AuthService');
 * logger.info('User logged in', { userId: '123' });
 *
 * // Config mode — created by LoggerManager.channel()
 * const logger = new LoggerService({ reporters: [new ConsoleReporter()] });
 * logger.info('Hello');
 *
 * // In React — via hook
 * const logger = useLogger('MyComponent');
 * logger.warn('Something looks off');
 * ```
 *
 * @module @stackra/ts-logger/services
 */

import { LogLevel } from "@stackra/contracts";
import type { ILogReporter, ILogEntry, ILogger, ILoggerConfig } from "@stackra/contracts";
import type { LoggerManager } from "./logger-manager.service";
import { ConsoleReporter } from "@/reporters/console.reporter";

/**
 * LoggerService — the consumer-facing logging API.
 *
 * Supports dual-mode construction:
 * - `new LoggerService('MyService')` — facade mode (delegates to manager)
 * - `new LoggerService({ reporters: [...] })` — config mode (direct output)
 * - `new LoggerService()` — facade mode, no context string
 *
 * @example
 * ```typescript
 * // Facade mode (most common for services)
 * const logger = new Logger('UserService');
 * logger.info('User logged in', { userId: '123' });
 *
 * // Config mode (used internally by LoggerManager.channel())
 * const logger = new LoggerService({
 *   reporters: [new ConsoleReporter()],
 *   context: { app: 'my-app' },
 * });
 * logger.info('Hello');
 * ```
 */
export class LoggerService implements ILogger {
  // ── Static members ────────────────────────────────────────────────────

  /**
   * Static reference to the active LoggerManager, set during module bootstrap.
   * This enables facade mode — `new Logger('Context')` resolves the default
   * channel from this reference without needing DI injection.
   */
  public static staticManagerRef: LoggerManager | undefined = undefined;

  /**
   * Set the static LoggerManager reference.
   * Called automatically by `LoggerModule.forRoot()` during bootstrap.
   *
   * @param manager - The bootstrapped LoggerManager instance
   */
  public static overrideLogger(manager: LoggerManager): void {
    LoggerService.staticManagerRef = manager;
  }

  /**
   * Lazily-created fallback logger for facade mode when no manager is set.
   * Uses a ConsoleReporter with Warn level to avoid noisy output before
   * the module is bootstrapped.
   */
  private static _fallbackLoggerInstance: LoggerService | undefined = undefined;

  /**
   * Get the fallback logger instance (created lazily on first access).
   *
   * @returns A minimal LoggerService with console output at Warn level
   */
  private static get _fallbackLogger(): LoggerService {
    if (!LoggerService._fallbackLoggerInstance) {
      LoggerService._fallbackLoggerInstance = new LoggerService({
        reporters: [new ConsoleReporter({ level: LogLevel.Warn })],
      });
    }
    return LoggerService._fallbackLoggerInstance;
  }

  // ── Instance members ──────────────────────────────────────────────────

  /** Whether this instance operates in facade or config mode. */
  private readonly _mode: "facade" | "config";

  /** The context string for facade mode (e.g., class name). */
  private readonly _contextString?: string;

  /** The channel configuration for config mode. */
  private readonly _config?: ILoggerConfig;

  /** The reporters for config mode. */
  private readonly _reporters?: ILogReporter[];

  /** The minimum level for config mode. */
  private _level: LogLevel = LogLevel.Debug;

  /** Persistent context merged into every log entry. */
  private _sharedContext: Record<string, unknown> = {};

  // ── Constructor ───────────────────────────────────────────────────────

  /**
   * Create a new LoggerService instance.
   *
   * @param configOrContext - Either a context string (facade mode) or
   *   a ILoggerConfig object (config mode). Omit for facade mode without context.
   */
  public constructor();
  public constructor(context: string);
  public constructor(config: ILoggerConfig);
  public constructor(configOrContext?: ILoggerConfig | string) {
    if (typeof configOrContext === "string" || configOrContext === undefined) {
      // Facade mode — delegates to the static manager
      this._mode = "facade";
      this._contextString = configOrContext;
    } else {
      // Config mode — wraps reporters directly
      this._mode = "config";
      this._config = configOrContext;
      this._reporters = configOrContext.reporters ?? [new ConsoleReporter()];
      this._level = configOrContext.level ?? LogLevel.Debug;
      if (configOrContext.context) {
        this._sharedContext = { ...configOrContext.context };
      }
    }
  }

  // ── Log methods ─────────────────────────────────────────────────────────

  /**
   * Log a message at the debug level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  public debug(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === "facade") {
      this.facadeDispatch("debug", message, context);
    } else {
      this.emit(LogLevel.Debug, message, context);
    }
  }

  /**
   * Log a message at the info level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  public info(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === "facade") {
      this.facadeDispatch("info", message, context);
    } else {
      this.emit(LogLevel.Info, message, context);
    }
  }

  /**
   * Log a message at the warn level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  public warn(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === "facade") {
      this.facadeDispatch("warn", message, context);
    } else {
      this.emit(LogLevel.Warn, message, context);
    }
  }

  /**
   * Log a message at the error level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  public error(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === "facade") {
      this.facadeDispatch("error", message, context);
    } else {
      this.emit(LogLevel.Error, message, context);
    }
  }

  /**
   * Log a message at the fatal level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  public fatal(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === "facade") {
      this.facadeDispatch("fatal", message, context);
    } else {
      this.emit(LogLevel.Fatal, message, context);
    }
  }

  // ── Context management ──────────────────────────────────────────────────

  /**
   * Add persistent context merged into every future log entry.
   *
   * @param context - Key-value pairs to add to the shared context
   * @returns This instance for fluent chaining
   *
   * @example
   * ```typescript
   * logger.withContext({ requestId: 'abc-123', userId: '42' });
   * logger.info('Processing'); // includes requestId and userId
   * ```
   */
  public withContext(context: Record<string, unknown>): this {
    this._sharedContext = { ...this._sharedContext, ...context };
    return this;
  }

  /**
   * Remove keys from shared context, or clear it entirely.
   *
   * @param keys - Optional array of keys to remove. Omit to clear all.
   * @returns This instance for fluent chaining
   */
  public withoutContext(keys?: string[]): this {
    if (!keys) {
      this._sharedContext = {};
    } else {
      for (const key of keys) {
        delete this._sharedContext[key];
      }
    }
    return this;
  }

  // ── Accessors ───────────────────────────────────────────────────────────

  /**
   * Get the reporters for this logger instance.
   *
   * @returns Array of active reporter instances
   */
  public getReporters(): ILogReporter[] {
    if (this._mode === "facade") {
      return this.resolveDelegate().getReporters();
    }
    return this._reporters!;
  }

  /**
   * Get the configuration for this logger instance.
   *
   * @returns The ILoggerConfig, or undefined in facade mode
   */
  public getConfig(): ILoggerConfig | undefined {
    if (this._mode === "facade") {
      return this.resolveDelegate().getConfig();
    }
    return this._config;
  }

  // ── Private — Facade delegation ─────────────────────────────────────────

  /**
   * Resolve the delegate LoggerService for facade mode.
   * Returns the default channel from the static manager, or the fallback logger.
   *
   * @returns The resolved LoggerService to delegate calls to
   */
  private resolveDelegate(): LoggerService {
    if (LoggerService.staticManagerRef) {
      return LoggerService.staticManagerRef.channel();
    }
    return LoggerService._fallbackLogger;
  }

  /**
   * Dispatch a log call in facade mode: resolve delegate, merge contexts, call method.
   *
   * @param method - The log level method name
   * @param message - The log message
   * @param callContext - Per-call context data
   */
  private facadeDispatch(
    method: "debug" | "info" | "warn" | "error" | "fatal",
    message: string,
    callContext: Record<string, unknown>,
  ): void {
    const delegate = this.resolveDelegate();
    const mergedContext: Record<string, unknown> = {
      ...(this._contextString !== undefined ? { context: this._contextString } : {}),
      ...this._sharedContext,
      ...callContext,
    };
    delegate[method](message, mergedContext);
  }

  // ── Private — Config-mode dispatch ──────────────────────────────────────

  /**
   * Emit a log entry to all reporters in config mode.
   *
   * Each reporter is wrapped in a try-catch to prevent a failing reporter
   * from blocking other reporters or crashing the application.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Per-call context data
   */
  private emit(level: LogLevel, message: string, context: Record<string, unknown>): void {
    // Skip entries below the channel's minimum level
    if (level < this._level) {
      return;
    }

    const entry: ILogEntry = {
      level,
      message,
      context: { ...this._sharedContext, ...context },
      timestamp: new Date().toISOString(),
    };

    for (const reporter of this._reporters!) {
      try {
        reporter.report(entry);
      } catch {
        // Silently swallow reporter errors to prevent propagation.
        // A failing reporter must never break other reporters or the application.
      }
    }
  }
}
