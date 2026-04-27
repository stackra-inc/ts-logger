/**
 * Logger Service
 *
 * The high-level API that consumers interact with. Supports two modes:
 *
 * - **Config Mode**: Wraps a channel's transporters and provides convenience
 *   methods (debug, info, warn, error, fatal). Created by LoggerManager.channel().
 *
 * - **Facade Mode**: Delegates log calls to the default channel resolved from
 *   a static LoggerManager reference. Allows `new Logger('MyService')` usage
 *   without dependency injection.
 *
 * @module services/logger
 */

import type { TransporterInterface } from '@/interfaces/transporter.interface';
import type { LogEntry } from '@/interfaces/log-entry.interface';
import type { LoggerConfig } from '@/interfaces/logger-config.interface';
import type { LoggerManager } from './logger-manager.service';
import { LogLevel } from '@/enums/log-level.enum';
import { ConsoleTransporter } from '@/transporters/console.transporter';

/**
 * LoggerService — the consumer-facing logging API.
 *
 * Supports dual-mode construction:
 * - `new LoggerService({ transporters: [...] })` — config mode (existing)
 * - `new LoggerService('MyService')` — facade mode (delegates to manager)
 * - `new LoggerService()` — facade mode, no context string
 *
 * @example
 * ```typescript
 * // Facade mode
 * const logger = new Logger('UserService');
 * logger.info('User logged in', { userId: '123' });
 *
 * // Config mode (used by LoggerManager.channel())
 * const logger = new LoggerService({ transporters: [new ConsoleTransporter()] });
 * logger.info('Hello');
 * ```
 */
export class LoggerService {
  // ── Static members ────────────────────────────────────────────────────

  /**
   * Static reference to the active LoggerManager, set during module bootstrap.
   */
  static staticManagerRef: LoggerManager | undefined = undefined;

  /**
   * Set the static LoggerManager reference.
   */
  static overrideLogger(manager: LoggerManager): void {
    LoggerService.staticManagerRef = manager;
  }

  /**
   * Lazily-created fallback logger for facade mode when no manager is set.
   * Uses a getter to avoid circular initialization issues at module load time.
   */
  private static _fallbackLoggerInstance: LoggerService | undefined = undefined;

  private static get _fallbackLogger(): LoggerService {
    if (!LoggerService._fallbackLoggerInstance) {
      LoggerService._fallbackLoggerInstance = new LoggerService({
        transporters: [new ConsoleTransporter()],
      });
    }
    return LoggerService._fallbackLoggerInstance;
  }

  // ── Instance members ──────────────────────────────────────────────────

  private readonly _mode: 'facade' | 'config';
  private _contextString?: string;
  private _config?: LoggerConfig;
  private _transporters?: TransporterInterface[];
  private _sharedContext: Record<string, unknown> = {};

  // ── Constructor ───────────────────────────────────────────────────────

  constructor();
  constructor(context: string);
  constructor(config: LoggerConfig);
  constructor(configOrContext?: LoggerConfig | string) {
    if (typeof configOrContext === 'string' || configOrContext === undefined) {
      // Facade mode
      this._mode = 'facade';
      this._contextString = configOrContext;
    } else {
      // Config mode (existing behavior)
      this._mode = 'config';
      this._config = configOrContext;
      this._transporters = configOrContext.transporters ?? [new ConsoleTransporter()];
      if (configOrContext.context) {
        this._sharedContext = { ...configOrContext.context };
      }
    }
  }

  // ── Log methods ─────────────────────────────────────────────────────────

  debug(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === 'facade') {
      this.facadeDispatch('debug', message, context);
    } else {
      this.dispatch(LogLevel.Debug, message, context);
    }
  }

  info(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === 'facade') {
      this.facadeDispatch('info', message, context);
    } else {
      this.dispatch(LogLevel.Info, message, context);
    }
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === 'facade') {
      this.facadeDispatch('warn', message, context);
    } else {
      this.dispatch(LogLevel.Warn, message, context);
    }
  }

  error(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === 'facade') {
      this.facadeDispatch('error', message, context);
    } else {
      this.dispatch(LogLevel.Error, message, context);
    }
  }

  fatal(message: string, context: Record<string, unknown> = {}): void {
    if (this._mode === 'facade') {
      this.facadeDispatch('fatal', message, context);
    } else {
      this.dispatch(LogLevel.Fatal, message, context);
    }
  }

  // ── Context ─────────────────────────────────────────────────────────────

  /**
   * Add persistent context merged into every future log entry.
   */
  withContext(context: Record<string, unknown>): this {
    this._sharedContext = { ...this._sharedContext, ...context };
    return this;
  }

  /**
   * Remove keys from shared context, or clear it entirely.
   */
  withoutContext(keys?: string[]): this {
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

  getTransporters(): TransporterInterface[] {
    if (this._mode === 'facade') {
      return this.resolveDelegate().getTransporters();
    }
    return this._transporters!;
  }

  getConfig(): LoggerConfig {
    if (this._mode === 'facade') {
      return this.resolveDelegate().getConfig();
    }
    return this._config!;
  }

  // ── Private — Facade delegation ─────────────────────────────────────────

  /**
   * Resolve the delegate LoggerService for facade mode.
   * Returns the default channel from the static manager, or the fallback logger.
   */
  private resolveDelegate(): LoggerService {
    if (LoggerService.staticManagerRef) {
      return LoggerService.staticManagerRef.channel();
    }
    return LoggerService._fallbackLogger;
  }

  /**
   * Dispatch a log call in facade mode: resolve delegate, merge contexts, call method.
   */
  private facadeDispatch(
    method: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    callContext: Record<string, unknown>
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

  private dispatch(level: LogLevel, message: string, context: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context: { ...this._sharedContext, ...context },
      timestamp: new Date().toISOString(),
    };

    for (const transporter of this._transporters!) {
      transporter.transport(entry);
    }
  }
}
