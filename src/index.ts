/**
 * @stackra/ts-logger
 *
 * Multi-channel logging system for the `@stackra` monorepo.
 * Built on consola with pluggable reporters, DI integration,
 * and a dual-mode ILogger facade.
 *
 * Provides:
 * - `ILogger` / `LoggerService` — dual-mode facade (new-able anywhere + DI config mode)
 * - `LoggerManager` — multi-channel manager (extends MultipleInstanceManager)
 * - `LoggerModule` — DI module with `forRoot()` configuration
 * - `@InjectLogger(channel?)` — decorator for channel injection
 * - `@InjectLoggerManager()` — decorator for manager injection
 * - `useLogger("Context")` — React hook for component logging
 * - `useLoggerContext()` — React hook for manager access
 * - `ConsoleReporter` — browser DevTools output via consola
 * - `StorageReporter` — localStorage persistence
 * - `SilentReporter` — no-op for testing
 * - `log` — module-level lazy proxy facade
 *
 * @example
 * ```typescript
 * import { LoggerModule, Logger, defineConfig, ConsoleReporter } from "@stackra/ts-logger";
 * import { Module, Injectable } from "@stackra/ts-container";
 *
 * // Configure
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot(defineConfig({
 *       default: "console",
 *       channels: {
 *         console: { reporters: [new ConsoleReporter()] },
 *       },
 *     })),
 *   ],
 * })
 * class AppModule {}
 *
 * // Use anywhere (facade mode)
 * const logger = new Logger('AuthService');
 * logger.info('User logged in', { userId: '123' });
 * ```
 *
 * @module @stackra/ts-logger
 */

// ============================================================================
// Module
// ============================================================================
export { LoggerModule } from "./logger.module";

// ============================================================================
// Services
// ============================================================================
export { LoggerService, Logger } from "./services";
export { LoggerManager } from "./services";

// ============================================================================
// Reporters
// ============================================================================
export { ConsoleReporter } from "./reporters";
export { StorageReporter } from "./reporters";
export { SilentReporter } from "./reporters";

// ============================================================================
// Decorators
// ============================================================================
export { InjectLogger } from "./decorators";
export { InjectLoggerManager } from "./decorators";
export { Reporter } from "./decorators";

// ============================================================================
// Hooks
// ============================================================================
export { useLogger } from "./hooks";
export { useLoggerContext } from "./hooks";

// ============================================================================
// Facades
// ============================================================================
export { log } from "./facades";

// ============================================================================
// Utilities
// ============================================================================
export { defineConfig } from "./utils";
export { getLoggerChannelToken } from "./utils";

// ============================================================================
// Constants
// ============================================================================
export { LEVEL_COLORS, REPORTER_METADATA } from "./constants";

// ============================================================================
// Errors
// ============================================================================
export { LoggerError } from "./errors";
