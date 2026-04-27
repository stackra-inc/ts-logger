/**
 * Log Facade
 *
 * Typed proxy for {@link LoggerManager} from `@stackra/ts-logger`.
 *
 * Logger channel manager. Manages named logging channels with multiple transporters.
 *
 * The facade is a module-level constant typed as `LoggerManager`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { LogFacade } from '@stackra/ts-logger';
 *
 * // Full autocomplete — no .proxy() call needed
 * LogFacade.channel();
 * ```
 *
 * ## Available methods (from {@link LoggerManager})
 *
 * - `channel(name?: string): LoggerService`
 * - `getChannelNames(): string[]`
 * - `hasChannel(name: string): boolean`
 * - `getDefaultChannelName(): string`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { LoggerManager } from '@/services/logger-manager.service';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(LoggerManager, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/log
 * @see {@link LoggerManager} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { LoggerManager } from '@/services/logger-manager.service';

/**
 * LogFacade — typed proxy for {@link LoggerManager}.
 *
 * Resolves `LoggerManager` from the DI container via the `LoggerManager` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * LogFacade.channel();
 * ```
 */
export const LogFacade: LoggerManager = Facade.make<LoggerManager>(LoggerManager);
