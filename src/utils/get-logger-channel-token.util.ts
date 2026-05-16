/**
 * Logger Channel Token Utility
 *
 * Returns the DI injection token for a named logger channel.
 * Used internally by `@InjectLogger()` and by `LoggerModule.forRoot()`
 * to register per-channel providers.
 *
 * The token follows the convention `"LoggerChannel:<name>"` where `<name>`
 * is the channel name from the logger configuration.
 *
 * @module @stackra/ts-logger/decorators
 */

/**
 * Returns the DI injection token for a named logger channel.
 *
 * @param channelName - The logger channel name (e.g., "console", "errors").
 *   Defaults to `"default"` if omitted.
 * @returns The logger channel injection token string
 *
 * @example
 * ```typescript
 * getLoggerChannelToken();           // "LoggerChannel:default"
 * getLoggerChannelToken('console');  // "LoggerChannel:console"
 * getLoggerChannelToken('errors');   // "LoggerChannel:errors"
 * ```
 */
export const getLoggerChannelToken = (channelName: string = "default"): string =>
  `LoggerChannel:${channelName}`;
