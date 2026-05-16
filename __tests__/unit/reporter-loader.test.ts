/**
 * Unit Tests — ReporterLoader
 *
 * Tests auto-discovery, channel attachment, and duplicate prevention.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReporterLoader } from "@/services/reporter-loader.service";
import { LoggerManager } from "@/services/logger-manager.service";
import { REPORTER_METADATA } from "@/constants";
import { defineMetadata } from "@vivtel/metadata";
import { LogLevel } from "@stackra/contracts";
import { SilentReporter } from "@/reporters/silent.reporter";
import type { ILoggerModuleOptions, ILogReporter } from "@stackra/contracts";

/**
 * Creates a mock DiscoveryService with the given providers.
 */
function createMockDiscovery(providers: Array<{ instance: unknown; isAlias?: boolean }>) {
  return {
    getProviders: vi.fn().mockReturnValue(providers),
  };
}

/**
 * Creates a LoggerManager with test config.
 */
function createTestManager(): LoggerManager {
  const config: ILoggerModuleOptions = {
    default: "console",
    channels: {
      console: { reporters: [new SilentReporter()] },
      errors: { reporters: [new SilentReporter()] },
      audit: { reporters: [new SilentReporter()] },
    },
  };
  return new LoggerManager(config);
}

describe("ReporterLoader", () => {
  let manager: LoggerManager;

  beforeEach(() => {
    manager = createTestManager();
  });

  // ── Auto-Discovery ──────────────────────────────────────────────────────

  describe("auto-discovery", () => {
    it("discovers and attaches @Reporter-decorated providers", () => {
      class SentryReporter implements ILogReporter {
        public readonly name = "sentry";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(REPORTER_METADATA, { name: "sentry", channels: ["errors"] }, SentryReporter);

      const instance = new SentryReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      const errorsChannel = manager.channel("errors");
      const reporters = errorsChannel.getReporters();
      expect(reporters.some((r) => r.name === "sentry")).toBe(true);
    });

    it("skips providers without @Reporter metadata", () => {
      class PlainService {
        public doSomething(): string {
          return "plain";
        }
      }

      const instance = new PlainService();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      const consoleChannel = manager.channel("console");
      const beforeCount = consoleChannel.getReporters().length;

      loader.onApplicationBootstrap();

      expect(consoleChannel.getReporters().length).toBe(beforeCount);
    });

    it("skips alias providers", () => {
      class AliasReporter implements ILogReporter {
        public readonly name = "alias";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(REPORTER_METADATA, { name: "alias" }, AliasReporter);

      const instance = new AliasReporter();
      const discovery = createMockDiscovery([{ instance, isAlias: true }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      const consoleChannel = manager.channel("console");
      expect(consoleChannel.getReporters().some((r) => r.name === "alias")).toBe(false);
    });

    it("skips providers with null instance", () => {
      const discovery = createMockDiscovery([{ instance: null }]);
      const loader = new ReporterLoader(discovery as any, manager);

      expect(() => loader.onApplicationBootstrap()).not.toThrow();
    });

    it("skips providers that do not implement report()", () => {
      class InvalidReporter {
        public readonly name = "invalid";
        public flush = vi.fn();
      }

      defineMetadata(REPORTER_METADATA, { name: "invalid" }, InvalidReporter);

      const instance = new InvalidReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      // Should not throw, just skip
      expect(() => loader.onApplicationBootstrap()).not.toThrow();
    });
  });

  // ── Channel Attachment ──────────────────────────────────────────────────

  describe("channel attachment", () => {
    it("attaches to specified channels only", () => {
      class ErrorReporter implements ILogReporter {
        public readonly name = "error-only";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(
        REPORTER_METADATA,
        { name: "error-only", channels: ["errors"] },
        ErrorReporter,
      );

      const instance = new ErrorReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      const errorsChannel = manager.channel("errors");
      const consoleChannel = manager.channel("console");

      expect(errorsChannel.getReporters().some((r) => r.name === "error-only")).toBe(true);
      expect(consoleChannel.getReporters().some((r) => r.name === "error-only")).toBe(false);
    });

    it("attaches to ALL channels when channels is empty", () => {
      class GlobalReporter implements ILogReporter {
        public readonly name = "global";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(REPORTER_METADATA, { name: "global", channels: [] }, GlobalReporter);

      const instance = new GlobalReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      expect(
        manager
          .channel("console")
          .getReporters()
          .some((r) => r.name === "global"),
      ).toBe(true);
      expect(
        manager
          .channel("errors")
          .getReporters()
          .some((r) => r.name === "global"),
      ).toBe(true);
      expect(
        manager
          .channel("audit")
          .getReporters()
          .some((r) => r.name === "global"),
      ).toBe(true);
    });

    it("attaches to ALL channels when channels is omitted", () => {
      class OmittedReporter implements ILogReporter {
        public readonly name = "omitted";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(REPORTER_METADATA, { name: "omitted" }, OmittedReporter);

      const instance = new OmittedReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      expect(
        manager
          .channel("console")
          .getReporters()
          .some((r) => r.name === "omitted"),
      ).toBe(true);
      expect(
        manager
          .channel("errors")
          .getReporters()
          .some((r) => r.name === "omitted"),
      ).toBe(true);
    });

    it("sets reporter level from decorator options", () => {
      class LeveledReporter implements ILogReporter {
        public readonly name = "leveled";
        public report = vi.fn();
        public flush = vi.fn();
        private _level = LogLevel.Debug;
        public getLevel(): LogLevel {
          return this._level;
        }
        public setLevel(level: LogLevel): void {
          this._level = level;
        }
      }

      defineMetadata(
        REPORTER_METADATA,
        { name: "leveled", level: LogLevel.Error },
        LeveledReporter,
      );

      const instance = new LeveledReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      expect(instance.getLevel()).toBe(LogLevel.Error);
    });

    it("warns when targeting a non-existent channel", () => {
      class MissingChannelReporter implements ILogReporter {
        public readonly name = "missing-channel";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(
        REPORTER_METADATA,
        { name: "missing-channel", channels: ["nonexistent"] },
        MissingChannelReporter,
      );

      const instance = new MissingChannelReporter();
      const discovery = createMockDiscovery([{ instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      loader.onApplicationBootstrap();

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ── Duplicate Prevention ────────────────────────────────────────────────

  describe("duplicate prevention", () => {
    it("does not attach the same reporter twice to a channel", () => {
      class DuplicateReporter implements ILogReporter {
        public readonly name = "duplicate";
        public report = vi.fn();
        public flush = vi.fn();
        public getLevel = vi.fn().mockReturnValue(LogLevel.Debug);
        public setLevel = vi.fn();
      }

      defineMetadata(
        REPORTER_METADATA,
        { name: "duplicate", channels: ["console"] },
        DuplicateReporter,
      );

      const instance = new DuplicateReporter();
      // Simulate two providers with same reporter name
      const discovery = createMockDiscovery([{ instance }, { instance }]);
      const loader = new ReporterLoader(discovery as any, manager);

      loader.onApplicationBootstrap();

      const consoleChannel = manager.channel("console");
      const duplicateCount = consoleChannel
        .getReporters()
        .filter((r) => r.name === "duplicate").length;
      expect(duplicateCount).toBe(1);
    });
  });
});
