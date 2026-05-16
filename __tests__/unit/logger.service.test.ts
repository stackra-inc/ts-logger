/**
 * Unit Tests — LoggerService
 *
 * Tests the consumer-facing logging API in both modes:
 * - Config mode: wraps reporters directly
 * - Facade mode: delegates to static LoggerManager reference
 *
 * Covers:
 * - All log levels (debug, info, warn, error, fatal)
 * - Level filtering (entries below threshold are skipped)
 * - Context merging (shared + per-call)
 * - withContext / withoutContext
 * - Facade mode delegation
 * - Fallback logger when no manager is set
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoggerService } from "@/services/logger.service";
import { SilentReporter } from "@/reporters/silent.reporter";
import { LogLevel } from "@stackra/contracts";
import type { ILogEntry, ILogReporter } from "@stackra/contracts";

/** Creates a spy reporter that captures all reported entries. */
function createSpyReporter(
  level: LogLevel = LogLevel.Debug,
): ILogReporter & { entries: ILogEntry[] } {
  const entries: ILogEntry[] = [];
  return {
    name: "spy",
    entries,
    report(entry: ILogEntry) {
      if (entry.level >= level) {
        entries.push(entry);
      }
    },
    flush() {},
    getLevel() {
      return level;
    },
    setLevel() {},
  };
}

describe("LoggerService", () => {
  // ══════════════════════════════════════════════════════════════════════════
  // Config Mode
  // ══════════════════════════════════════════════════════════════════════════

  describe("config mode", () => {
    let logger: LoggerService;
    let spy: ReturnType<typeof createSpyReporter>;

    beforeEach(() => {
      spy = createSpyReporter();
      logger = new LoggerService({ reporters: [spy] });
    });

    it("logs debug messages", () => {
      logger.debug("test message");
      expect(spy.entries).toHaveLength(1);
      expect(spy.entries[0]!.level).toBe(LogLevel.Debug);
      expect(spy.entries[0]!.message).toBe("test message");
    });

    it("logs info messages", () => {
      logger.info("info msg");
      expect(spy.entries[0]!.level).toBe(LogLevel.Info);
    });

    it("logs warn messages", () => {
      logger.warn("warn msg");
      expect(spy.entries[0]!.level).toBe(LogLevel.Warn);
    });

    it("logs error messages", () => {
      logger.error("error msg");
      expect(spy.entries[0]!.level).toBe(LogLevel.Error);
    });

    it("logs fatal messages", () => {
      logger.fatal("fatal msg");
      expect(spy.entries[0]!.level).toBe(LogLevel.Fatal);
    });

    it("includes per-call context in entries", () => {
      logger.info("with context", { userId: "123" });
      expect(spy.entries[0]!.context).toEqual({ userId: "123" });
    });

    it("includes timestamp in entries", () => {
      logger.info("timestamped");
      expect(spy.entries[0]!.timestamp).toBeDefined();
      expect(typeof spy.entries[0]!.timestamp).toBe("string");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Level Filtering
  // ══════════════════════════════════════════════════════════════════════════

  describe("level filtering", () => {
    it("skips entries below the configured level", () => {
      const spy = createSpyReporter();
      // Logger with Warn minimum level
      const logger = new LoggerService({ reporters: [spy], level: LogLevel.Warn });

      logger.debug("should be skipped");
      logger.info("should be skipped");
      logger.warn("should appear");
      logger.error("should appear");

      expect(spy.entries).toHaveLength(2);
      expect(spy.entries[0]!.level).toBe(LogLevel.Warn);
      expect(spy.entries[1]!.level).toBe(LogLevel.Error);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Context Management
  // ══════════════════════════════════════════════════════════════════════════

  describe("context management", () => {
    it("withContext adds persistent context to all entries", () => {
      const spy = createSpyReporter();
      const logger = new LoggerService({ reporters: [spy] });

      logger.withContext({ requestId: "abc" });
      logger.info("first");
      logger.info("second");

      expect(spy.entries[0]!.context).toEqual({ requestId: "abc" });
      expect(spy.entries[1]!.context).toEqual({ requestId: "abc" });
    });

    it("merges shared context with per-call context", () => {
      const spy = createSpyReporter();
      const logger = new LoggerService({ reporters: [spy] });

      logger.withContext({ app: "test" });
      logger.info("merged", { action: "login" });

      expect(spy.entries[0]!.context).toEqual({ app: "test", action: "login" });
    });

    it("withoutContext removes specific keys", () => {
      const spy = createSpyReporter();
      const logger = new LoggerService({ reporters: [spy] });

      logger.withContext({ a: "1", b: "2" });
      logger.withoutContext(["a"]);
      logger.info("after removal");

      expect(spy.entries[0]!.context).toEqual({ b: "2" });
    });

    it("withoutContext() with no args clears all context", () => {
      const spy = createSpyReporter();
      const logger = new LoggerService({ reporters: [spy] });

      logger.withContext({ a: "1", b: "2" });
      logger.withoutContext();
      logger.info("cleared");

      expect(spy.entries[0]!.context).toEqual({});
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Facade Mode
  // ══════════════════════════════════════════════════════════════════════════

  describe("facade mode", () => {
    afterEach(() => {
      LoggerService.staticManagerRef = undefined;
    });

    it("creates a facade logger with context string", () => {
      // Facade mode — no manager set, uses fallback
      const logger = new LoggerService("MyService");
      // Should not throw
      logger.info("test");
    });

    it("delegates to static manager when set", () => {
      const spy = createSpyReporter();
      const channelLogger = new LoggerService({ reporters: [spy] });

      // Mock manager
      const mockManager = {
        channel: () => channelLogger,
      } as any;

      LoggerService.staticManagerRef = mockManager;

      const logger = new LoggerService("TestContext");
      logger.info("delegated message");

      expect(spy.entries).toHaveLength(1);
      expect(spy.entries[0]!.message).toBe("delegated message");
      expect(spy.entries[0]!.context).toHaveProperty("context", "TestContext");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Accessors
  // ══════════════════════════════════════════════════════════════════════════

  describe("accessors", () => {
    it("getReporters returns the configured reporters", () => {
      const silent = new SilentReporter();
      const logger = new LoggerService({ reporters: [silent] });
      expect(logger.getReporters()).toContain(silent);
    });

    it("getConfig returns the configuration", () => {
      const config = { reporters: [new SilentReporter()], level: LogLevel.Warn };
      const logger = new LoggerService(config);
      expect(logger.getConfig()).toEqual(config);
    });
  });
});
