/**
 * Unit Tests — Error Resilience
 *
 * Tests that reporter.report() calls are wrapped in try-catch to prevent
 * propagation when a reporter throws.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, vi } from "vitest";
import { LoggerService } from "@/services/logger.service";
import { LogLevel } from "@stackra/contracts";
import type { ILogReporter } from "@stackra/contracts";

describe("Error resilience", () => {
  it("does not propagate errors from a failing reporter", () => {
    const failingReporter: ILogReporter = {
      name: "failing",
      report: vi.fn().mockImplementation(() => {
        throw new Error("Reporter crashed");
      }),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const logger = new LoggerService({
      reporters: [failingReporter],
      level: LogLevel.Debug,
    });

    // Should not throw despite the reporter throwing
    expect(() => logger.info("test message")).not.toThrow();
    expect(() => logger.error("error message")).not.toThrow();
    expect(() => logger.fatal("fatal message")).not.toThrow();
  });

  it("other reporters still receive entries when one fails", () => {
    const failingReporter: ILogReporter = {
      name: "failing",
      report: vi.fn().mockImplementation(() => {
        throw new Error("Reporter crashed");
      }),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const workingReporter: ILogReporter = {
      name: "working",
      report: vi.fn(),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const logger = new LoggerService({
      reporters: [failingReporter, workingReporter],
      level: LogLevel.Debug,
    });

    logger.info("test message");

    // The failing reporter was called (and threw)
    expect(failingReporter.report).toHaveBeenCalled();
    // The working reporter still received the entry
    expect(workingReporter.report).toHaveBeenCalled();
  });

  it("handles multiple failing reporters gracefully", () => {
    const failing1: ILogReporter = {
      name: "failing1",
      report: vi.fn().mockImplementation(() => {
        throw new Error("First failure");
      }),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const failing2: ILogReporter = {
      name: "failing2",
      report: vi.fn().mockImplementation(() => {
        throw new TypeError("Second failure");
      }),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const working: ILogReporter = {
      name: "working",
      report: vi.fn(),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const logger = new LoggerService({
      reporters: [failing1, failing2, working],
      level: LogLevel.Debug,
    });

    logger.warn("test");

    expect(failing1.report).toHaveBeenCalled();
    expect(failing2.report).toHaveBeenCalled();
    expect(working.report).toHaveBeenCalled();
  });

  it("does not affect level filtering behavior", () => {
    const reporter: ILogReporter = {
      name: "test",
      report: vi.fn(),
      flush: vi.fn(),
      getLevel: vi.fn().mockReturnValue(LogLevel.Debug),
      setLevel: vi.fn(),
    };

    const logger = new LoggerService({
      reporters: [reporter],
      level: LogLevel.Warn,
    });

    logger.debug("should be filtered");
    logger.info("should be filtered");
    logger.warn("should pass");

    // Only the warn entry should reach the reporter
    expect(reporter.report).toHaveBeenCalledTimes(1);
  });
});
