/**
 * defineConfig — Type-Safe Logger Configuration Helper
 *
 * Identity function that provides full IDE autocomplete and type
 * checking for `LoggerModuleOptions`. Use in config files to get
 * type safety without explicit type annotations.
 *
 * @module @stackra/ts-logger/utils
 */

import type { ILoggerModuleOptions } from "@stackra/contracts";

/**
 * Type-safe configuration helper for the logger module.
 *
 * @param config - Logger module options
 * @returns The same config object (identity function for type inference)
 *
 * @example
 * ```typescript
 * import { defineConfig, ConsoleReporter } from "@stackra/ts-logger";
 *
 * const loggerConfig = defineConfig({
 *   default: "console",
 *   channels: {
 *     console: { reporters: [new ConsoleReporter()] },
 *     silent: { reporters: [new SilentReporter()] },
 *   },
 * });
 *
 * export default loggerConfig;
 * ```
 */
export function defineConfig(config: ILoggerModuleOptions): ILoggerModuleOptions {
  return config;
}
