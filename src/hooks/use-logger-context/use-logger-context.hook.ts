/**
 * useLoggerContext Hook
 *
 * React hook for managing logger context in components.
 * Automatically adds and removes context based on component lifecycle.
 *
 * @module hooks/use-logger-context
 */

import { useEffect } from 'react';
import { useLogger } from '@/hooks/use-logger';

/**
 * Manage logger context in React components.
 *
 * Automatically adds context when the component mounts and removes it when unmounted.
 *
 * @param context - Context to add to the logger
 * @param channelName - Optional channel name (uses default if not specified)
 *
 * @example
 * ```typescript
 * function UserProfile({ userId }: { userId: string }) {
 *   useLoggerContext({ userId, component: 'UserProfile' });
 *
 *   const logger = useLogger();
 *   logger.info('Profile loaded');
 *
 *   return <div>Profile</div>;
 * }
 * ```
 */
export function useLoggerContext(context: Record<string, unknown>, channelName?: string): void {
  const logger = useLogger(channelName);

  useEffect(() => {
    logger.withContext(context);

    return () => {
      logger.withoutContext(Object.keys(context));
    };
  }, [logger, context]);
}
