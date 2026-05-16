/**
 * useLoggerContext — React Hook for Shared Logger Context
 *
 * Provides access to the LoggerManager for advanced use cases in React
 * components — such as adding shared context that persists across
 * multiple log calls, or switching channels dynamically.
 *
 * For simple logging, prefer `useLogger("ComponentName")` instead.
 *
 * @module @stackra/ts-logger/hooks
 */

import { useInject } from "@stackra/ts-container/react";
import { LOGGER_MANAGER } from "@stackra/contracts";
import type { LoggerManager } from "@/services/logger-manager.service";

/**
 * Get the LoggerManager instance for advanced logging operations.
 *
 * @returns The DI-managed LoggerManager instance
 *
 * @example
 * ```tsx
 * import { useLoggerContext } from "@stackra/ts-logger";
 *
 * function App() {
 *   const loggerManager = useLoggerContext();
 *
 *   useEffect(() => {
 *     // Add global context to all channels
 *     loggerManager.channel().withContext({ sessionId: getSessionId() });
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useLoggerContext(): LoggerManager {
  return useInject<LoggerManager>(LOGGER_MANAGER);
}
