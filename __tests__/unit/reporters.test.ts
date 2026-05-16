/**
 * Unit Tests — Reporters
 *
 * Tests the SilentReporter and verifies the reporter interface contract.
 * ConsoleReporter is tested indirectly via LoggerService tests (it uses consola
 * which is hard to mock in isolation).
 *
 * Covers:
 * - SilentReporter: no-op behavior, level get/set
 * - Reporter interface compliance
 * - LogLevel comparison correctness
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect } from "vitest";
import { SilentReporter } from "@/reporters/silent.reporter";
import { LogLevel } from "@stackra/contracts";
import type { ILogEntry } from "@stackra/contracts";

/** Creates a test log entry at the specified level. */
function createEntry(level: LogLevel, message = "test"): ILogEntry {
  return {
    level,
    message,
    context: {},
    timestamp: new Date().toISOString(),
  };
}

describe("SilentReporter", () => {
  it("implements the ILogReporter interface", () => {
    const reporter = new SilentReporter();
    expect(reporter.name).toBe("silent");
    expect(typeof reporter.report).toBe("function");
    expect(typeof reporter.flush).toBe("function");
    expect(typeof reporter.getLevel).toBe("function");
    expect(typeof reporter.setLevel).toBe("function");
  });

  it("report() does not throw", () => {
    const reporter = new SilentReporter();
    // Should silently discard without error
    expect(() => reporter.report(createEntry(LogLevel.Fatal))).not.toThrow();
  });

  it("flush() does not throw", () => {
    const reporter = new SilentReporter();
    expect(() => reporter.flush()).not.toThrow();
  });

  it("getLevel returns the current level", () => {
    const reporter = new SilentReporter();
    expect(reporter.getLevel()).toBe(LogLevel.Debug);
  });

  it("setLevel updates the level", () => {
    const reporter = new SilentReporter();
    reporter.setLevel(LogLevel.Error);
    expect(reporter.getLevel()).toBe(LogLevel.Error);
  });
});

describe("LogLevel comparison", () => {
  /**
   * Verifies that LogLevel enum values are ordered correctly for
   * numeric comparison: Debug(0) < Info(1) < Warn(2) < Error(3) < Fatal(4).
   *
   * This is critical because reporters use `entry.level < this._level`
   * to filter entries below their threshold.
   */
  it("levels are ordered Debug < Info < Warn < Error < Fatal", () => {
    expect(LogLevel.Debug).toBeLessThan(LogLevel.Info);
    expect(LogLevel.Info).toBeLessThan(LogLevel.Warn);
    expect(LogLevel.Warn).toBeLessThan(LogLevel.Error);
    expect(LogLevel.Error).toBeLessThan(LogLevel.Fatal);
  });

  it("level filtering works correctly with numeric comparison", () => {
    // Simulates what reporters do: skip entries below threshold
    const threshold = LogLevel.Warn;

    expect(LogLevel.Debug < threshold).toBe(true); // skipped
    expect(LogLevel.Info < threshold).toBe(true); // skipped
    expect(LogLevel.Warn < threshold).toBe(false); // reported
    expect(LogLevel.Error < threshold).toBe(false); // reported
    expect(LogLevel.Fatal < threshold).toBe(false); // reported
  });
});
