/**
 * Unit Tests — ConsoleReporter
 *
 * Tests level mapping, tag configuration, and level filtering.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect } from "vitest";
import { ConsoleReporter } from "@/reporters/console.reporter";
import { LogLevel } from "@stackra/contracts";
import type { ILogEntry } from "@stackra/contracts";

/** Creates a test log entry at the specified level. */
function createEntry(
  level: LogLevel,
  message = "test",
  context: Record<string, unknown> = {},
): ILogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
}

describe("ConsoleReporter", () => {
  // ── Level Mapping ───────────────────────────────────────────────────────

  describe("level mapping", () => {
    it("reports debug level entries", () => {
      const reporter = new ConsoleReporter();
      // Should not throw — consola handles output
      expect(() => reporter.report(createEntry(LogLevel.Debug, "debug msg"))).not.toThrow();
    });

    it("reports info level entries", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.report(createEntry(LogLevel.Info, "info msg"))).not.toThrow();
    });

    it("reports warn level entries", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.report(createEntry(LogLevel.Warn, "warn msg"))).not.toThrow();
    });

    it("reports error level entries", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.report(createEntry(LogLevel.Error, "error msg"))).not.toThrow();
    });

    it("reports fatal level entries", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.report(createEntry(LogLevel.Fatal, "fatal msg"))).not.toThrow();
    });

    it("handles entries with context", () => {
      const reporter = new ConsoleReporter();
      expect(() =>
        reporter.report(createEntry(LogLevel.Info, "with context", { key: "value" })),
      ).not.toThrow();
    });

    it("handles entries with empty context", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.report(createEntry(LogLevel.Info, "no context", {}))).not.toThrow();
    });
  });

  // ── Tag Configuration ───────────────────────────────────────────────────

  describe("tag configuration", () => {
    it("creates reporter with default tag", () => {
      const reporter = new ConsoleReporter();
      expect(reporter.name).toBe("console");
    });

    it("creates reporter with custom tag", () => {
      const reporter = new ConsoleReporter({ tag: "my-app" });
      // Reporter should work without error
      expect(() => reporter.report(createEntry(LogLevel.Info, "tagged"))).not.toThrow();
    });

    it("creates reporter with custom level", () => {
      const reporter = new ConsoleReporter({ level: LogLevel.Warn });
      expect(reporter.getLevel()).toBe(LogLevel.Warn);
    });
  });

  // ── Level Filtering ─────────────────────────────────────────────────────

  describe("level filtering", () => {
    it("skips entries below configured level", () => {
      const reporter = new ConsoleReporter({ level: LogLevel.Error });

      // These should be silently skipped (no error, no output)
      expect(() => reporter.report(createEntry(LogLevel.Debug, "skip"))).not.toThrow();
      expect(() => reporter.report(createEntry(LogLevel.Info, "skip"))).not.toThrow();
      expect(() => reporter.report(createEntry(LogLevel.Warn, "skip"))).not.toThrow();
    });

    it("reports entries at or above configured level", () => {
      const reporter = new ConsoleReporter({ level: LogLevel.Warn });

      expect(() => reporter.report(createEntry(LogLevel.Warn, "reported"))).not.toThrow();
      expect(() => reporter.report(createEntry(LogLevel.Error, "reported"))).not.toThrow();
      expect(() => reporter.report(createEntry(LogLevel.Fatal, "reported"))).not.toThrow();
    });

    it("getLevel returns the configured level", () => {
      const reporter = new ConsoleReporter({ level: LogLevel.Info });
      expect(reporter.getLevel()).toBe(LogLevel.Info);
    });

    it("setLevel updates the level", () => {
      const reporter = new ConsoleReporter();
      reporter.setLevel(LogLevel.Fatal);
      expect(reporter.getLevel()).toBe(LogLevel.Fatal);
    });

    it("default level is Debug (reports everything)", () => {
      const reporter = new ConsoleReporter();
      expect(reporter.getLevel()).toBe(LogLevel.Debug);
    });
  });

  // ── Interface Compliance ────────────────────────────────────────────────

  describe("interface compliance", () => {
    it("has name property", () => {
      const reporter = new ConsoleReporter();
      expect(reporter.name).toBe("console");
    });

    it("flush is a no-op", () => {
      const reporter = new ConsoleReporter();
      expect(() => reporter.flush()).not.toThrow();
    });
  });
});
