/**
 * Logger — alias for LoggerService.
 *
 * Provides the familiar `new Logger('Context')` pattern used throughout
 * the monorepo. This is the recommended import for service-level logging.
 *
 * @module @stackra/ts-logger
 * @category Services
 */

import { LoggerService } from "./logger.service";

/**
 * Logger alias for LoggerService.
 *
 * Provides the familiar `new Logger('Context')` pattern used throughout
 * the monorepo. This is the recommended import for service-level logging.
 */
export const Logger = LoggerService;
