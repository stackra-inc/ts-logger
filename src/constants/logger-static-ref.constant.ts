/**
 * Logger Static Ref Token
 *
 * Internal DI token used to wire the static LoggerManager reference
 * on LoggerService during module bootstrap. This enables the
 * `new Logger('Context')` facade pattern to work without DI injection.
 *
 * This token is never injected by consumers — it exists solely as a
 * side-effect factory that runs during bootstrap.
 *
 * @module @stackra/ts-logger/constants
 * @internal
 */

/**
 * Internal token for the logger static reference wiring factory.
 */
export const LOGGER_STATIC_REF = "LoggerStaticRef";
