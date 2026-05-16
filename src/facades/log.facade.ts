/**
 * log — Logger DI Proxy
 *
 * Module-level constant typed as `LoggerManager`. Lazily resolves the
 * service from the DI container on first property access — safe to use
 * at module scope before bootstrap completes.
 *
 * This is the most ergonomic way to access the logger outside of
 * class constructors (where `@InjectLogger()` is preferred).
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { IApplication } from '@stackra/ts-container';
 * const app = await IApplication.create(AppModule);
 * // LoggerModule.forRoot() wires the static ref automatically
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { log } from '@stackra/ts-logger';
 *
 * log.channel().info('Application started');
 * log.channel('errors').error('Something failed');
 * ```
 *
 * @module @stackra/ts-logger/facades
 */

import { inject } from "@stackra/ts-container";
import { LoggerManager } from "@/services/logger-manager.service";

/**
 * log — typed proxy for {@link LoggerManager}.
 *
 * Resolves `LoggerManager` from the DI container via the `inject()` utility.
 * All property and method access is forwarded to the resolved instance.
 *
 * Call `IApplication.create(AppModule)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * import { log } from '@stackra/ts-logger';
 *
 * log.channel().info('Hello from facade');
 * log.channel('errors').error('Critical failure', { code: 500 });
 * ```
 */
export const log: LoggerManager = inject<LoggerManager>(LoggerManager);
