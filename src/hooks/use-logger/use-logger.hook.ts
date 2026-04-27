/**
 * useLogger Hook
 *
 * React hook for accessing the logger service in components.
 * Provides access to the default channel or a specific channel.
 *
 * @module hooks/use-logger
 */

import { useInject } from '@stackra/ts-container';
import { LoggerManager } from '@/services/logger-manager.service';
import type { LoggerService } from '@/services/logger.service';

/**
 * Access a LoggerService in React components.
 *
 * Returns a LoggerService for the specified channel (or default).
 *
 * @param channelName - Optional channel name (uses default if not specified)
 * @returns LoggerService instance
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const logger = useLogger();
 *   logger.info('Component rendered');
 *   return <div>Hello</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * function ErrorBoundary({ error }: { error: Error }) {
 *   const errorLogger = useLogger('errors');
 *   errorLogger.error('Component error', { message: error.message });
 *   return <div>Something went wrong</div>;
 * }
 * ```
 */
export function useLogger(channelName?: string): LoggerService {
  const manager = useInject(LoggerManager);
  return manager.channel(channelName);
}
