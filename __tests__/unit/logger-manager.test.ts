/**
 * Unit Tests — LoggerManager
 *
 * Tests channel creation, caching, lifecycle, forgetChannel, and purge.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoggerManager } from "@/services/logger-manager.service";
import { ConsoleReporter } from "@/reporters/console.reporter";
import { SilentReporter } from "@/reporters/silent.reporter";
import type { ILoggerModuleOptions } from "@stackra/contracts";

/**
 * Creates a LoggerManager with the given config.
 */
function createManager(config: ILoggerModuleOptions): LoggerManager {
  return new LoggerManager(config);
}

describe("LoggerManager", () => {
  let config: ILoggerModuleOptions;
  let manager: LoggerManager;

  beforeEach(() => {
    config = {
      default: "console",
      channels: {
        console: { reporters: [new ConsoleReporter()] },
        silent: { reporters: [new SilentReporter()] },
        errors: { reporters: [new ConsoleReporter({ level: 3 })] },
      },
    };
    manager = createManager(config);
  });

  // ── Channel Creation ────────────────────────────────────────────────────

  describe("channel creation", () => {
    it("creates the default channel", () => {
      const logger = manager.channel();
      expect(logger).toBeDefined();
    });

    it("creates a named channel", () => {
      const logger = manager.channel("silent");
      expect(logger).toBeDefined();
    });

    it("creates channel with reporters from config", () => {
      const logger = manager.channel("console");
      const reporters = logger.getReporters();
      expect(reporters.length).toBeGreaterThan(0);
    });
  });

  // ── Caching ─────────────────────────────────────────────────────────────

  describe("caching", () => {
    it("returns the same instance for repeated calls", () => {
      const first = manager.channel("console");
      const second = manager.channel("console");
      expect(first).toBe(second);
    });

    it("returns different instances for different channels", () => {
      const console = manager.channel("console");
      const silent = manager.channel("silent");
      expect(console).not.toBe(silent);
    });

    it("default channel is cached", () => {
      const first = manager.channel();
      const second = manager.channel();
      expect(first).toBe(second);
    });
  });

  // ── Lifecycle ───────────────────────────────────────────────────────────

  describe("lifecycle", () => {
    it("onModuleInit creates default channel eagerly", () => {
      manager.onModuleInit();
      expect(manager.isChannelActive()).toBe(true);
    });

    it("onModuleInit handles invalid default channel gracefully", () => {
      const badConfig: ILoggerModuleOptions = {
        default: "nonexistent",
        channels: {},
      };
      const badManager = createManager(badConfig);
      expect(() => badManager.onModuleInit()).not.toThrow();
    });

    it("onModuleDestroy clears all cached channels", async () => {
      manager.channel("console");
      manager.channel("silent");

      await manager.onModuleDestroy();

      expect(manager.isChannelActive("console")).toBe(false);
      expect(manager.isChannelActive("silent")).toBe(false);
    });

    it("onModuleDestroy flushes reporters", async () => {
      const reporter = new SilentReporter();
      const flushSpy = vi.spyOn(reporter, "flush");

      const flushConfig: ILoggerModuleOptions = {
        default: "test",
        channels: {
          test: { reporters: [reporter] },
        },
      };
      const flushManager = createManager(flushConfig);
      flushManager.channel("test");

      await flushManager.onModuleDestroy();

      expect(flushSpy).toHaveBeenCalled();
    });
  });

  // ── forgetChannel ───────────────────────────────────────────────────────

  describe("forgetChannel", () => {
    it("removes a specific cached channel", () => {
      const first = manager.channel("console");
      manager.forgetChannel("console");
      const second = manager.channel("console");
      expect(first).not.toBe(second);
    });

    it("removes multiple channels when given an array", () => {
      const con = manager.channel("console");
      const sil = manager.channel("silent");
      manager.forgetChannel(["console", "silent"]);
      expect(manager.channel("console")).not.toBe(con);
      expect(manager.channel("silent")).not.toBe(sil);
    });

    it("removes default channel when called without arguments", () => {
      const first = manager.channel();
      manager.forgetChannel();
      const second = manager.channel();
      expect(first).not.toBe(second);
    });

    it("returns this for chaining", () => {
      const result = manager.forgetChannel("console");
      expect(result).toBe(manager);
    });
  });

  // ── Purge ───────────────────────────────────────────────────────────────

  describe("purge", () => {
    it("clears all cached channels", () => {
      const con = manager.channel("console");
      const sil = manager.channel("silent");
      manager.purge();
      expect(manager.channel("console")).not.toBe(con);
      expect(manager.channel("silent")).not.toBe(sil);
    });

    it("isChannelActive returns false after purge", () => {
      manager.channel("console");
      manager.purge();
      expect(manager.isChannelActive("console")).toBe(false);
    });
  });

  // ── Introspection ───────────────────────────────────────────────────────

  describe("introspection", () => {
    it("getChannelNames returns all configured channel names", () => {
      const names = manager.getChannelNames();
      expect(names).toContain("console");
      expect(names).toContain("silent");
      expect(names).toContain("errors");
    });

    it("hasChannel returns true for configured channels", () => {
      expect(manager.hasChannel("console")).toBe(true);
    });

    it("hasChannel returns false for unconfigured channels", () => {
      expect(manager.hasChannel("nonexistent")).toBe(false);
    });

    it("isChannelActive returns false before access", () => {
      expect(manager.isChannelActive("console")).toBe(false);
    });

    it("isChannelActive returns true after access", () => {
      manager.channel("console");
      expect(manager.isChannelActive("console")).toBe(true);
    });

    it("getDefaultInstance returns configured default", () => {
      expect(manager.getDefaultInstance()).toBe("console");
    });

    it("setDefaultInstance changes the default", () => {
      manager.setDefaultInstance("silent");
      expect(manager.getDefaultInstance()).toBe("silent");
    });
  });
});
