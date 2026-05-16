/**
 * Integration Tests — LoggerModule.forRoot() → injection → logging flow
 *
 * Tests the DI module registration, provider creation, and injection tokens.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect } from "vitest";
import { LoggerModule } from "@/logger.module";
import { LoggerManager } from "@/services/logger-manager.service";
import { LoggerService } from "@/services/logger.service";
import { ConsoleReporter } from "@/reporters/console.reporter";
import { SilentReporter } from "@/reporters/silent.reporter";
import { LOGGER_CONFIG, LOGGER_MANAGER } from "@stackra/contracts";
import { getLoggerChannelToken } from "@/utils/get-logger-channel-token.util";
import type { ILoggerModuleOptions } from "@stackra/contracts";

describe("LoggerModule integration", () => {
  const config: ILoggerModuleOptions = {
    default: "console",
    channels: {
      console: { reporters: [new ConsoleReporter()] },
      silent: { reporters: [new SilentReporter()] },
    },
  };

  // ── forRoot ─────────────────────────────────────────────────────────────

  describe("forRoot", () => {
    it("returns a DynamicModule with correct module reference", () => {
      const result = LoggerModule.forRoot(config);
      expect(result.module).toBe(LoggerModule);
    });

    it("marks module as global", () => {
      const result = LoggerModule.forRoot(config);
      expect(result.global).toBe(true);
    });

    it("registers LOGGER_CONFIG provider", () => {
      const result = LoggerModule.forRoot(config);
      const configProvider = result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any;
      expect(configProvider).toBeDefined();
      expect(configProvider.useValue).toBeDefined();
    });

    it("registers LoggerManager as class provider", () => {
      const result = LoggerModule.forRoot(config);
      const managerProvider = result.providers?.find(
        (p: any) => p.provide === LoggerManager,
      ) as any;
      expect(managerProvider).toBeDefined();
      expect(managerProvider.useClass).toBe(LoggerManager);
    });

    it("registers LOGGER_MANAGER as alias to LoggerManager", () => {
      const result = LoggerModule.forRoot(config);
      const aliasProvider = result.providers?.find((p: any) => p.provide === LOGGER_MANAGER) as any;
      expect(aliasProvider).toBeDefined();
      expect(aliasProvider.useExisting).toBe(LoggerManager);
    });

    it("creates per-channel factory providers", () => {
      const result = LoggerModule.forRoot(config);
      const channelNames = Object.keys(config.channels);

      for (const name of channelNames) {
        const token = getLoggerChannelToken(name);
        const provider = result.providers?.find((p: any) => p.provide === token) as any;
        expect(provider).toBeDefined();
        expect(provider.useFactory).toBeTypeOf("function");
        expect(provider.inject).toContain(LoggerManager);
      }
    });

    it("creates default channel token provider", () => {
      const result = LoggerModule.forRoot(config);
      const defaultToken = getLoggerChannelToken();
      const provider = result.providers?.find((p: any) => p.provide === defaultToken) as any;
      expect(provider).toBeDefined();
    });

    it("exports LoggerManager, LOGGER_MANAGER, LOGGER_CONFIG, and channel tokens", () => {
      const result = LoggerModule.forRoot(config);
      expect(result.exports).toContain(LoggerManager);
      expect(result.exports).toContain(LOGGER_MANAGER);
      expect(result.exports).toContain(LOGGER_CONFIG);
      expect(result.exports).toContain(getLoggerChannelToken());
    });
  });

  // ── Injection Flow ──────────────────────────────────────────────────────

  describe("injection flow", () => {
    it("channel factory resolves to LoggerService", () => {
      const result = LoggerModule.forRoot(config);
      const consoleToken = getLoggerChannelToken("console");
      const provider = result.providers?.find((p: any) => p.provide === consoleToken) as any;

      // Simulate what DI does: call the factory with a real manager
      const processedConfig = (
        result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any
      ).useValue;
      const manager = new LoggerManager(processedConfig);
      const service = provider.useFactory(manager);

      expect(service).toBeInstanceOf(LoggerService);
    });

    it("default channel factory resolves to LoggerService", () => {
      const result = LoggerModule.forRoot(config);
      const defaultToken = getLoggerChannelToken();
      const provider = result.providers?.find((p: any) => p.provide === defaultToken) as any;

      const processedConfig = (
        result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any
      ).useValue;
      const manager = new LoggerManager(processedConfig);
      const service = provider.useFactory(manager);

      expect(service).toBeInstanceOf(LoggerService);
    });

    it("logging through resolved service works end-to-end", () => {
      const result = LoggerModule.forRoot(config);
      const processedConfig = (
        result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any
      ).useValue;
      const manager = new LoggerManager(processedConfig);
      const logger = manager.channel("silent");

      // Should not throw
      expect(() => logger.info("integration test")).not.toThrow();
      expect(() => logger.error("error test", { code: 500 })).not.toThrow();
    });
  });

  // ── Config Processing ───────────────────────────────────────────────────

  describe("config processing", () => {
    it("adds default ConsoleReporter to channels without reporters", () => {
      const bareConfig: ILoggerModuleOptions = {
        default: "bare",
        channels: {
          bare: {},
        },
      };
      const result = LoggerModule.forRoot(bareConfig);
      const processedConfig = (
        result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any
      ).useValue;

      const manager = new LoggerManager(processedConfig);
      const logger = manager.channel("bare");
      const reporters = logger.getReporters();

      expect(reporters.length).toBeGreaterThan(0);
    });

    it("adds SilentReporter to channel named 'silent' without reporters", () => {
      const silentConfig: ILoggerModuleOptions = {
        default: "silent",
        channels: {
          silent: {},
        },
      };
      const result = LoggerModule.forRoot(silentConfig);
      const processedConfig = (
        result.providers?.find((p: any) => p.provide === LOGGER_CONFIG) as any
      ).useValue;

      const manager = new LoggerManager(processedConfig);
      const logger = manager.channel("silent");
      const reporters = logger.getReporters();

      expect(reporters.some((r) => r.name === "silent")).toBe(true);
    });
  });

  // ── Channel Tokens ──────────────────────────────────────────────────────

  describe("channel tokens", () => {
    it("getLoggerChannelToken returns consistent tokens", () => {
      const token1 = getLoggerChannelToken("console");
      const token2 = getLoggerChannelToken("console");
      expect(token1).toBe(token2);
    });

    it("getLoggerChannelToken returns different tokens for different names", () => {
      const consoleToken = getLoggerChannelToken("console");
      const silentToken = getLoggerChannelToken("silent");
      expect(consoleToken).not.toBe(silentToken);
    });
  });
});
