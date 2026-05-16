/**
 * Hooks barrel export.
 *
 * React hooks are conditionally exported. If React is not available
 * in the environment, calling these hooks will throw a clear error
 * message guiding the developer to install the optional peer dependency.
 *
 * @module @stackra/ts-logger/hooks
 */
export { useLogger } from "./use-logger";
export { useLoggerContext } from "./use-logger-context";
