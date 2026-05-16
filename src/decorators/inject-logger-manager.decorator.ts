/**
 * LoggerManager Injection Decorator
 *
 * Provides `@InjectLoggerManager()` which wraps
 * `@Inject(LOGGER_MANAGER)` from @stackra/ts-container.
 *
 * Use this when you need direct access to the LoggerManager for
 * advanced operations like switching channels at runtime, extending
 * drivers, or introspecting the logger configuration.
 *
 * For most use cases, prefer `@InjectLogger()` which gives you a
 * `LoggerService` directly.
 *
 * @module @stackra/ts-logger/decorators
 */

import { Inject } from "@stackra/ts-container";
import { LOGGER_MANAGER } from "@stackra/contracts";

/**
 * Injects the {@link LoggerManager} from the DI container.
 *
 * @returns A parameter/property decorator
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import { InjectLoggerManager, LoggerManager } from '@stackra/ts-logger';
 *
 * @Injectable()
 * class LogAdminService {
 *   public constructor(
 *     @InjectLoggerManager() private readonly manager: LoggerManager,
 *   ) {}
 *
 *   public getChannelNames(): string[] {
 *     return this.manager.getChannelNames();
 *   }
 *
 *   public switchDefault(channelName: string): void {
 *     this.manager.setDefaultInstance(channelName);
 *   }
 * }
 * ```
 */
export const InjectLoggerManager = (): PropertyDecorator & ParameterDecorator =>
  Inject(LOGGER_MANAGER);
