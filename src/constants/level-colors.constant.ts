/**
 * Level Colors Constant
 *
 * CSS color strings for browser console styling, keyed by log level.
 * Applied via `%c` formatting by consola's browser reporter when
 * custom badge styling is needed.
 *
 * These colors follow Material Design color guidelines for semantic
 * meaning: grey for debug, blue for info, orange for warnings,
 * red for errors, and inverted red for fatal.
 *
 * @module @stackra/ts-logger/constants
 */

import { LogLevel } from "@stackra/contracts";

/**
 * Mapping of log levels to CSS color strings for browser console styling.
 *
 * Used by the `ConsoleReporter` when applying custom badge styles
 * to log output in browser DevTools.
 *
 * @example
 * ```typescript
 * const style = LEVEL_COLORS[LogLevel.Error]; // 'color: #F44336'
 * console.log('%c[ERROR]%c message', style, 'color: inherit');
 * ```
 */
export const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.Debug]: "color: #8B8B8B",
  [LogLevel.Info]: "color: #2196F3",
  [LogLevel.Warn]: "color: #FF9800",
  [LogLevel.Error]: "color: #F44336",
  [LogLevel.Fatal]:
    "color: #FFFFFF; background: #F44336; font-weight: bold; padding: 1px 4px; border-radius: 2px",
};
