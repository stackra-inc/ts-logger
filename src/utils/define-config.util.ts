/**
 * Define Config Utility
 *
 * Helper function to define logger configuration with type safety.
 *
 * @module @stackra/ts-logger
 */

import type { LoggerModuleOptions } from '@/interfaces/logger-module-options.interface';

/**
 * Helper function to define logger configuration with type safety
 *
 * Provides IDE autocomplete and type checking for configuration objects.
 * This pattern is consistent with modern tooling (Vite, Vitest, etc.).
 *
 * @param config - The logger configuration object
 * @returns The same configuration object with proper typing
 *
 * @example
 * ```typescript
 * // logger.config.ts
 * import { defineConfig, ConsoleTransporter, LogLevel } from '@stackra/ts-logger';
 *
 * export default defineConfig({
 *   default: 'console',
 *   channels: {
 *     console: {
 *       transporters: [new ConsoleTransporter({ level: LogLevel.Debug })],
 *       context: { app: 'my-app' },
 *     },
 *   },
 * });
 * ```
 */
export function defineConfig(config: LoggerModuleOptions): LoggerModuleOptions {
  return config;
}
