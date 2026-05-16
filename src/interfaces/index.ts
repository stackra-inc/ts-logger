/**
 * Interfaces barrel export.
 *
 * Cross-package interfaces (ILogEntry, ILogReporter, ILogger, ILoggerConfig,
 * ILoggerModuleOptions, IReporterOptions) live in @stackra/contracts.
 * This barrel exports internal interfaces specific to this package's
 * reporter implementations.
 *
 * @module @stackra/ts-logger/interfaces
 */
export type { ConsoleReporterOptions } from "./console-reporter-options.interface";
export type { StorageReporterOptions } from "./storage-reporter-options.interface";
