/**
 * Dependency Injection Tokens
 *
 * Defines DI tokens for the logger package.
 * Used with @stackra/ts-container for dependency injection.
 *
 * @module constants/tokens
 */

/**
 * Logger configuration token
 *
 * Used to inject the logger configuration into the LoggerManager.
 */
export const LOGGER_CONFIG = Symbol.for('LOGGER_CONFIG');

/**
 * Logger manager token
 *
 * Used to inject the LoggerManager via useExisting alias.
 * Follows the same pattern as REDIS_MANAGER and CACHE_MANAGER.
 */
export const LOGGER_MANAGER = Symbol.for('LOGGER_MANAGER');
