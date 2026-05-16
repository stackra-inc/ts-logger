/**
 * LoggerModule — DI Module for the Logging System
 *
 * Registers:
 * - `LOGGER_CONFIG` — raw config object
 * - `LoggerManager` — created by DI so @Inject decorators fire
 * - `LOGGER_MANAGER` — useExisting alias to LoggerManager
 * - `LoggerChannel:<name>` — per-channel LoggerService factories for @InjectLogger()
 * - `LoggerChannel:default` — alias to the configured default channel
 * - `LOGGER_STATIC_REF` — sets the static manager ref on LoggerService
 *
 * Users inject `LOGGER_MANAGER` (or `LoggerManager` directly) and call
 * `manager.channel()` to get a `LoggerService`, or use `@InjectLogger()`
 * to inject a LoggerService directly, or use the `useLogger()` hook.
 *
 * @module @stackra/ts-logger
 */

import { Global, Module, type IDynamicModule } from "@stackra/ts-container";
import { LOGGER_CONFIG, LOGGER_MANAGER } from "@stackra/contracts";
import type { ILoggerModuleOptions } from "@stackra/contracts";
import type { ILoggerConfig } from "@stackra/contracts";
import { LoggerManager } from "@/services/logger-manager.service";
import { LoggerService } from "@/services/logger.service";
import { ReporterLoader } from "@/services/reporter-loader.service";
import { getLoggerChannelToken } from "@/utils/get-logger-channel-token.util";
import { LOGGER_STATIC_REF } from "@/constants";
import { ConsoleReporter } from "@/reporters/console.reporter";
import { SilentReporter } from "@/reporters/silent.reporter";

/**
 * LoggerModule — provides multi-channel logging with DI integration.
 *
 * @example
 * ```typescript
 * import { Module } from "@stackra/ts-container";
 * import { LoggerModule, defineConfig, ConsoleReporter } from "@stackra/ts-logger";
 *
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot(
 *       defineConfig({
 *         default: "console",
 *         channels: {
 *           console: { reporters: [new ConsoleReporter()] },
 *           silent: { reporters: [new SilentReporter()] },
 *         },
 *       }),
 *     ),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class LoggerModule {
  /**
   * Configure the logger module with runtime configuration.
   *
   * Registers providers for:
   * 1. `LOGGER_CONFIG` — the raw config object
   * 2. `LoggerManager` — the class-based provider
   * 3. `LOGGER_MANAGER` — token-based alias
   * 4. `LOGGER_STATIC_REF` — wires the static manager ref on LoggerService
   * 5. Per-channel factory providers for `@InjectLogger(channelName)`
   * 6. Default channel provider for `@InjectLogger()`
   *
   * @param config - Logger configuration with named channels
   * @returns A IDynamicModule with all logger providers registered and exported
   */
  public static forRoot(config: ILoggerModuleOptions): IDynamicModule {
    const processedConfig = LoggerModule.processConfig(config);

    // Build per-channel factory providers so @InjectLogger('channelName') resolves
    const channelProviders = Object.keys(processedConfig.channels).map((channelName) => ({
      provide: getLoggerChannelToken(channelName),
      useFactory: (manager: LoggerManager) => manager.channel(channelName),
      inject: [LoggerManager],
    }));

    // Register the "default" token pointing to the configured default channel
    const defaultChannelProvider = {
      provide: getLoggerChannelToken(),
      useFactory: (manager: LoggerManager) => manager.channel(),
      inject: [LoggerManager],
    };

    // Collect all channel tokens for export
    const channelTokens = [
      getLoggerChannelToken(),
      ...Object.keys(processedConfig.channels).map(getLoggerChannelToken),
    ];

    return {
      module: LoggerModule,
      global: true,
      providers: [
        { provide: LOGGER_CONFIG, useValue: processedConfig },
        { provide: LoggerManager, useClass: LoggerManager },
        { provide: LOGGER_MANAGER, useExisting: LoggerManager },
        ReporterLoader,
        {
          provide: LOGGER_STATIC_REF,
          useFactory: (manager: LoggerManager) => {
            // Wire the static reference so `new Logger('Context')` works
            LoggerService.staticManagerRef = manager;
            return manager;
          },
          inject: [LoggerManager],
        },
        defaultChannelProvider,
        ...channelProviders,
      ],
      exports: [LoggerManager, LOGGER_MANAGER, LOGGER_CONFIG, ...channelTokens],
    };
  }

  /**
   * Process configuration to add default reporters if needed.
   * Ensures every channel has at least one reporter — defaults to
   * ConsoleReporter for normal channels and SilentReporter for "silent".
   *
   * @param config - Raw user configuration
   * @returns Processed configuration with guaranteed reporters
   */
  private static processConfig(config: ILoggerModuleOptions): ILoggerModuleOptions {
    const processedChannels: Record<string, ILoggerConfig> = {};

    for (const name in config.channels) {
      if (Object.prototype.hasOwnProperty.call(config.channels, name)) {
        const channelConfig = config.channels[name];
        if (!channelConfig) continue;

        if (!channelConfig.reporters || channelConfig.reporters.length === 0) {
          if (name === "silent") {
            processedChannels[name] = {
              ...channelConfig,
              reporters: [new SilentReporter()],
            };
          } else {
            processedChannels[name] = {
              ...channelConfig,
              reporters: [new ConsoleReporter()],
            };
          }
        } else {
          processedChannels[name] = channelConfig;
        }
      }
    }

    return {
      ...config,
      channels: processedChannels,
    };
  }
}
