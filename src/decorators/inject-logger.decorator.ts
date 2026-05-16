/**
 * Logger Channel Injection Decorator
 *
 * Provides `@InjectLogger(channelName?)` which wraps
 * `@Inject(getLoggerChannelToken(channelName))` from @stackra/ts-container.
 *
 * This is the **primary decorator** for injecting a logger into services.
 * It resolves a `LoggerService` instance for the specified channel
 * (or the default channel if no name is provided).
 *
 * @module @stackra/ts-logger/decorators
 */

import { Inject } from "@stackra/ts-container";
import { getLoggerChannelToken } from "@/utils/get-logger-channel-token.util";

/**
 * Injects a {@link LoggerService} for the specified channel.
 *
 * When used without arguments, injects the default logger channel.
 * When a channel name is provided, injects the LoggerService for that
 * specific named channel.
 *
 * Requires `LoggerModule.forRoot()` to be imported in your application
 * and the channel name to be registered in the configuration.
 *
 * @param channelName - Optional channel name. Uses `"default"` if omitted.
 * @returns A parameter/property decorator
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import { InjectLogger } from '@stackra/ts-logger';
 * import type { LoggerService } from '@stackra/ts-logger';
 *
 * @Injectable()
 * class UserService {
 *   public constructor(
 *     @InjectLogger() private readonly logger: LoggerService,
 *     @InjectLogger('errors') private readonly errorLog: LoggerService,
 *   ) {}
 *
 *   public async createUser(data: UserData): Promise<void> {
 *     this.logger.info('Creating user', { userId: data.id });
 *     try {
 *       // ...
 *     } catch (err: Error | unknown) {
 *       this.errorLog.error('Failed to create user', { error: String(err) });
 *     }
 *   }
 * }
 * ```
 */
export const InjectLogger = (channelName?: string): PropertyDecorator & ParameterDecorator =>
  Inject(getLoggerChannelToken(channelName));
