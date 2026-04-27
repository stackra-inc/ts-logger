# @stackra/ts-logger

## 1.0.0

### Major Features

- 🎉 Initial release of @stackra/ts-logger
- 🏗️ `LoggerModule.forRoot()` with DynamicModule DI pattern
- 📦 `LoggerManager` extending `MultipleInstanceManager` for named channels
- 🎯 `LoggerService` wrapping channel transporters with `debug`, `info`, `warn`,
  `error`, `fatal`
- 🖥️ `ConsoleTransporter` with colors, emoji, and expandable context objects
- 💾 `StorageTransporter` for localStorage persistence with max entry limit
- 🔇 `SilentTransporter` for testing (no-op)
- 🎨 `PrettyFormatter` with colors and emoji (console default)
- 📋 `JsonFormatter` for structured JSON output (storage default)
- 📝 `SimpleFormatter` for plain text output
- 🔢 `LogLevel` enum: Debug, Info, Warning, Error, Fatal
- 🪝 `withContext()` / `withoutContext()` for contextual logging
- ⚛️ React hooks: `useLogger(channel?)`, `useLoggerContext(context, channel?)`
- 🏷️ DI tokens: `LOGGER_CONFIG`, `LOGGER_MANAGER`
- 🛠️ `defineConfig()` type-safe config helper
- 🔄 Lifecycle hooks: `onModuleInit()` warms default channel,
  `onModuleDestroy()` cleans up
