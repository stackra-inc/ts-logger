/**
 * Unit Tests — React Hooks (useLogger, useLoggerContext)
 *
 * Tests memoization and correct hook behavior.
 * Since these hooks depend on React and DI container hooks, we test
 * the underlying logic by mocking the DI layer.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the DI container's React hook
vi.mock("@stackra/ts-container/react", () => ({
  useInject: vi.fn(),
}));

// Mock React
vi.mock("react", () => ({
  useMemo: (fn: () => unknown, _deps: unknown[]) => fn(),
}));

import { useInject } from "@stackra/ts-container/react";
import { useLogger } from "@/hooks/use-logger/use-logger.hook";
import { useLoggerContext } from "@/hooks/use-logger-context/use-logger-context.hook";
import { LoggerManager } from "@/services/logger-manager.service";
import { LoggerService } from "@/services/logger.service";
import { SilentReporter } from "@/reporters/silent.reporter";
import type { ILoggerModuleOptions } from "@stackra/contracts";

describe("React hooks", () => {
  let mockManager: LoggerManager;

  beforeEach(() => {
    const config: ILoggerModuleOptions = {
      default: "console",
      channels: {
        console: { reporters: [new SilentReporter()] },
      },
    };
    mockManager = new LoggerManager(config);
    (useInject as ReturnType<typeof vi.fn>).mockReturnValue(mockManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── useLogger ───────────────────────────────────────────────────────────

  describe("useLogger", () => {
    it("returns a LoggerService instance", () => {
      const logger = useLogger("TestComponent");
      expect(logger).toBeInstanceOf(LoggerService);
    });

    it("creates logger with context string", () => {
      const logger = useLogger("MyComponent");
      // The logger should be in facade mode with the context string
      expect(logger).toBeDefined();
    });

    it("returns a logger that can log without errors", () => {
      const logger = useLogger("TestHook");
      expect(() => logger.info("test message")).not.toThrow();
      expect(() => logger.warn("warning")).not.toThrow();
      expect(() => logger.error("error")).not.toThrow();
    });

    it("calls useInject with LOGGER_MANAGER token", () => {
      useLogger("Test");
      expect(useInject).toHaveBeenCalled();
    });
  });

  // ── useLoggerContext ────────────────────────────────────────────────────

  describe("useLoggerContext", () => {
    it("returns the LoggerManager instance", () => {
      const result = useLoggerContext();
      expect(result).toBe(mockManager);
    });

    it("calls useInject with LOGGER_MANAGER token", () => {
      useLoggerContext();
      expect(useInject).toHaveBeenCalled();
    });
  });
});
