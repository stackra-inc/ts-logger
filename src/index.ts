/**
 * @stackra/ts-logger
 *
 * A lightweight, client-side logging package inspired by Laravel's
 * logging architecture. Provides a clean interface for structured
 * logging with pluggable transporters, customizable formatters,
 * contextual logging, colors, and emoji support.
 *
 * @module @stackra/ts-logger
 */

// ============================================================================
// Enums
// ============================================================================
export { LogLevel } from './enums';

// ============================================================================
// Core Interfaces
// ============================================================================
export type { LogEntry } from './interfaces';
export type { FormatterInterface } from './interfaces';
export type { TransporterInterface } from './interfaces';
export type { LoggerInterface } from './interfaces';
export type { LoggerConfig } from './interfaces';
export type { LoggerModuleOptions } from './interfaces';
export type { LoggerServiceInterface } from './interfaces';
export type { ConsoleTransporterOptions } from './interfaces';
export type { StorageTransporterOptions } from './interfaces';

// ============================================================================
// Services (DI)
// ============================================================================
export { LoggerManager } from './services/logger-manager.service';
export { LoggerService } from './services/logger.service';
export { LoggerService as Logger } from './services/logger.service';

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { LoggerModule } from './logger.module';

// ============================================================================
// Constants / Tokens
// ============================================================================
export { LOGGER_CONFIG, LOGGER_MANAGER } from './constants/tokens.constant';
export { LEVEL_COLORS } from './constants/level-colors.constant';

// ============================================================================
// Utils
// ============================================================================
export { defineConfig } from './utils';

// ============================================================================
// Formatters
// ============================================================================
export { PrettyFormatter } from './formatters';
export { JsonFormatter } from './formatters';
export { SimpleFormatter } from './formatters';

// ============================================================================
// Transporters
// ============================================================================
export { ConsoleTransporter } from './transporters';
export { SilentTransporter } from './transporters';
export { StorageTransporter } from './transporters';

// ============================================================================
// React Hooks
// ============================================================================
export { useLogger } from './hooks/use-logger';
export { useLoggerContext } from './hooks/use-logger-context';

// ============================================================================
// Facades
// ============================================================================
export { LogFacade } from './facades';
