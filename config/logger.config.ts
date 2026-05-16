/**
 * Logger Configuration
 *
 * Unified logger configuration following Laravel and NestJS patterns.
 * All logging channels and settings are defined in a single config object.
 *
 * ## Architecture
 *
 * ```
 * LoggerManager
 *   ├── channel('console')  → ConsoleReporter (browser DevTools via consola)
 *   ├── channel('storage')  → StorageReporter (localStorage persistence)
 *   ├── channel('combined') → ConsoleReporter + StorageReporter
 *   ├── channel('errors')   → ConsoleReporter(Error) + StorageReporter
 *   └── channel('silent')   → SilentReporter (no-op)
 * ```
 *
 * ## Environment Variables
 *
 * | Variable                     | Description                    | Default        |
 * |------------------------------|--------------------------------|----------------|
 * | `VITE_LOG_CHANNEL`           | Default log channel            | `'console'`    |
 * | `VITE_LOG_LEVEL`             | Minimum log level              | `'debug'`      |
 * | `VITE_APP_NAME`              | Application name for context   | `'stackra-app'`|
 * | `VITE_LOG_STORAGE_MAX`       | Max entries in storage channel | `500`          |
 * | `VITE_LOG_STORAGE_KEY`       | localStorage key for logs      | `'app-logs'`   |
 * | `VITE_LOG_ERROR_STORAGE_KEY` | localStorage key for errors    | `'error-logs'` |
 * | `VITE_LOG_AUDIT_STORAGE_KEY` | localStorage key for audit     | `'audit-logs'` |
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import loggerConfig from '@/config/logger.config';
 *
 * @Module({
 *   imports: [LoggerModule.forRoot(loggerConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @module config/logger
 */

import { defineConfig, ConsoleReporter, StorageReporter, SilentReporter } from "@stackra/ts-logger";
import { LogLevel } from "@stackra/contracts";

/**
 * Logger configuration.
 *
 * Single unified configuration object that automatically adapts to your
 * environment via `env()`. Similar to Laravel's `config/logging.php`.
 */
const loggerConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that will be used to write
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration array.
  |
  */
  default: env("VITE_LOG_CHANNEL", "console"),

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application. Each
  | channel can have multiple reporters for different outputs.
  |
  */
  channels: {
    /**
     * Console Channel
     *
     * Logs to the browser DevTools via consola. Good for development.
     * Uses consola's native formatting with colors and structured objects.
     */
    console: {
      reporters: [
        new ConsoleReporter({
          level: (env("VITE_LOG_LEVEL", "debug") as unknown as LogLevel) ?? LogLevel.Debug,
          tag: env("VITE_APP_NAME", "stackra-app"),
        }),
      ],
      context: {
        app: env("VITE_APP_NAME", "stackra-app"),
        env: env("NODE_ENV", "development"),
      },
    },

    /**
     * Storage Channel
     *
     * Persists logs to localStorage. Good for debugging and audit trails.
     * Entries survive page reloads and can be exported for bug reports.
     */
    storage: {
      reporters: [
        new StorageReporter({
          key: env("VITE_LOG_STORAGE_KEY", "app-logs"),
          maxEntries: env("VITE_LOG_STORAGE_MAX", 500),
        }),
      ],
      context: {
        app: env("VITE_APP_NAME", "stackra-app"),
      },
    },

    /**
     * Combined Channel
     *
     * Logs to both console and storage. Good for production environments
     * where you want DevTools output AND persistent history.
     */
    combined: {
      reporters: [
        new ConsoleReporter({ level: LogLevel.Info }),
        new StorageReporter({
          key: env("VITE_LOG_STORAGE_KEY", "app-logs"),
          maxEntries: 1000,
        }),
      ],
      context: {
        app: env("VITE_APP_NAME", "stackra-app"),
        env: env("NODE_ENV", "production"),
      },
    },

    /**
     * Error Channel
     *
     * Only logs errors and critical messages. Useful for error monitoring
     * and alerting. Persists to a separate storage key for easy extraction.
     */
    errors: {
      level: LogLevel.Error,
      reporters: [
        new ConsoleReporter({ level: LogLevel.Error }),
        new StorageReporter({
          key: env("VITE_LOG_ERROR_STORAGE_KEY", "error-logs"),
          maxEntries: 200,
          level: LogLevel.Error,
        }),
      ],
      context: {
        app: env("VITE_APP_NAME", "stackra-app"),
        channel: "errors",
      },
    },

    /**
     * Audit Channel
     *
     * For audit trails and compliance logging. Stores all logs without
     * console output. Useful for tracking user actions.
     */
    audit: {
      reporters: [
        new StorageReporter({
          key: env("VITE_LOG_AUDIT_STORAGE_KEY", "audit-logs"),
          maxEntries: 1000,
        }),
      ],
      context: {
        app: env("VITE_APP_NAME", "stackra-app"),
        channel: "audit",
      },
    },

    /**
     * Silent Channel
     *
     * Disables all logging. Useful for testing environments where
     * log output would pollute test results.
     */
    silent: {
      reporters: [new SilentReporter()],
    },
  },
});

export default loggerConfig;
