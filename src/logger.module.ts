/**
 * Logger Module
 *
 * Registers:
 * - `LOGGER_CONFIG` — raw config object
 * - `LoggerManager` — created by DI so @Inject decorators fire
 * - `LOGGER_MANAGER` — useExisting alias to LoggerManager
 *
 * Users inject LOGGER_MANAGER and call manager.channel() to get a LoggerService,
 * or use the useLogger() hook which does this automatically.
 *
 * @module logger.module
 */

import { Module, type DynamicModule, Global } from '@stackra/ts-container';

import type { LoggerModuleOptions } from './interfaces/logger-module-options.interface';
import { LoggerManager } from './services/logger-manager.service';
import { LoggerService } from './services/logger.service';
import { LOGGER_CONFIG, LOGGER_MANAGER } from './constants/tokens.constant';
import { ConsoleTransporter } from './transporters/console.transporter';
import { SilentTransporter } from './transporters/silent.transporter';
import type { LoggerConfig } from './interfaces/logger-config.interface';

@Global()
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class LoggerModule {
  /**
   * Configure the logger module with runtime configuration.
   *
   * @param config - Logger configuration with named channels
   * @returns DynamicModule with all logger providers
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     LoggerModule.forRoot(
   *       defineConfig({
   *         default: 'console',
   *         channels: {
   *           console: { transporters: [new ConsoleTransporter()] },
   *           silent: { transporters: [new SilentTransporter()] },
   *         },
   *       })
   *     ),
   *   ],
   * })
   * class AppModule {}
   * ```
   */
  static forRoot(config: LoggerModuleOptions): DynamicModule {
    const processedConfig = LoggerModule.processConfig(config);

    return {
      module: LoggerModule,
      global: true,
      providers: [
        { provide: LOGGER_CONFIG, useValue: processedConfig },
        { provide: LoggerManager, useClass: LoggerManager },
        { provide: LOGGER_MANAGER, useExisting: LoggerManager },
        {
          provide: 'LOGGER_STATIC_REF',
          useFactory: (manager: LoggerManager) => {
            LoggerService.staticManagerRef = manager;
            return manager;
          },
          inject: [LoggerManager],
        },
      ],
      exports: [LoggerManager, LOGGER_MANAGER, LOGGER_CONFIG],
    };
  }

  /**
   * Process configuration to add default transporters if needed.
   */
  private static processConfig(config: LoggerModuleOptions): LoggerModuleOptions {
    const processedChannels: Record<string, LoggerConfig> = {};

    for (const name in config.channels) {
      if (Object.prototype.hasOwnProperty.call(config.channels, name)) {
        const channelConfig = config.channels[name];
        if (!channelConfig) continue;

        if (!channelConfig.transporters || channelConfig.transporters.length === 0) {
          if (name === 'silent') {
            processedChannels[name] = {
              ...channelConfig,
              transporters: [new SilentTransporter()],
            };
          } else {
            processedChannels[name] = {
              ...channelConfig,
              transporters: [new ConsoleTransporter()],
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
