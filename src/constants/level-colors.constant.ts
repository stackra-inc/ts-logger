/**
 * Level Colors Constant
 *
 * CSS color strings for browser console styling, keyed by log level.
 * Applied via `%c` formatting in `console.log()` by the `ConsoleTransporter`.
 *
 * @module constants/level-colors
 */

import { LogLevel } from '@/enums';

/**
 * Mapping of log levels to CSS color strings for browser console styling.
 *
 * These colors are applied via `%c` formatting in `console.log`.
 * Used by `ConsoleTransporter` when paired with `PrettyFormatter`.
 *
 * @example
 * ```typescript
 * const style = LEVEL_COLORS[LogLevel.Error]; // 'color: #F44336'
 * console.log('%c[ERROR]%c message', style, 'color: inherit');
 * ```
 */
export const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'color: #8B8B8B',
  [LogLevel.Info]: 'color: #2196F3',
  [LogLevel.Warn]: 'color: #FF9800',
  [LogLevel.Error]: 'color: #F44336',
  [LogLevel.Fatal]:
    'color: #FFFFFF; background: #F44336; font-weight: bold; padding: 1px 4px; border-radius: 2px',
};
