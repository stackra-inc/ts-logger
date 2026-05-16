/**
 * useLogger — React Hook for Component-Level Logging
 *
 * Returns a `LoggerService` instance scoped to the given context name.
 * The context is automatically included in every log entry, making it
 * easy to trace logs back to their originating component.
 *
 * Uses the DI-managed `LoggerManager` under the hood — the default
 * channel is resolved and a context-scoped wrapper is returned.
 *
 * Requires React as a peer dependency. If React is not installed,
 * importing this module will fail at build time with a clear module
 * resolution error. React is marked as an optional peer dependency
 * in package.json — only install it if you use the hooks.
 *
 * @module @stackra/ts-logger/hooks
 */

import { useMemo } from "react";
import { useInject } from "@stackra/ts-container/react";
import { LOGGER_MANAGER } from "@stackra/contracts";
import type { LoggerManager } from "@/services/logger-manager.service";
import { LoggerService } from "@/services/logger.service";

/**
 * Get a logger instance scoped to a React component or hook.
 *
 * The returned logger automatically includes the context name in
 * every log entry, making it easy to identify the source in DevTools.
 *
 * @param context - The context name (typically the component or hook name)
 * @param channel - Optional channel name. Uses default if omitted.
 * @returns A LoggerService instance with the context pre-set
 *
 * @example
 * ```tsx
 * import { useLogger } from "@stackra/ts-logger";
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const logger = useLogger("UserProfile");
 *
 *   useEffect(() => {
 *     logger.info("Profile loaded", { userId });
 *   }, [userId]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useLogger(context: string, channel?: string): LoggerService {
  const manager = useInject<LoggerManager>(LOGGER_MANAGER);

  return useMemo(() => {
    // Create a LoggerService in facade mode with the context string.
    // The facade delegates to the manager's default channel automatically.
    const scoped = new LoggerService(context);
    return scoped;
  }, [manager, context, channel]);
}
