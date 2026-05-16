/**
 * Unit Tests — StorageReporter
 *
 * Tests persistence, maxEntries trimming, error swallowing, clear, and getEntries.
 *
 * @module @stackra/ts-logger/tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StorageReporter } from "@/reporters/storage.reporter";
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

/**
 * Mock localStorage for Node.js test environment.
 */
function setupLocalStorage(): { storage: Map<string, string> } {
  const storage = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    get length() {
      return storage.size;
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: mockStorage,
    writable: true,
    configurable: true,
  });

  return { storage };
}

describe("StorageReporter", () => {
  let reporter: StorageReporter;

  beforeEach(() => {
    setupLocalStorage();
    reporter = new StorageReporter({ key: "test-logs", maxEntries: 5 });
  });

  afterEach(() => {
    reporter.clear();
  });

  // ── Persistence ─────────────────────────────────────────────────────────

  describe("persistence", () => {
    it("persists log entries to localStorage", () => {
      reporter.report(createEntry(LogLevel.Info, "hello"));
      const entries = reporter.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0]!.message).toBe("hello");
    });

    it("persists multiple entries in order", () => {
      reporter.report(createEntry(LogLevel.Info, "first"));
      reporter.report(createEntry(LogLevel.Warn, "second"));
      reporter.report(createEntry(LogLevel.Error, "third"));

      const entries = reporter.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0]!.message).toBe("first");
      expect(entries[1]!.message).toBe("second");
      expect(entries[2]!.message).toBe("third");
    });

    it("preserves entry level and context", () => {
      const entry: ILogEntry = {
        level: LogLevel.Error,
        message: "error occurred",
        context: { code: 500, path: "/api" },
        timestamp: "2024-01-01T00:00:00.000Z",
      };
      reporter.report(entry);

      const entries = reporter.getEntries();
      expect(entries[0]!.level).toBe(LogLevel.Error);
      expect(entries[0]!.context).toEqual({ code: 500, path: "/api" });
    });
  });

  // ── maxEntries Trimming ─────────────────────────────────────────────────

  describe("maxEntries trimming", () => {
    it("trims oldest entries when exceeding maxEntries", () => {
      for (let i = 0; i < 7; i++) {
        reporter.report(createEntry(LogLevel.Info, `msg-${i}`));
      }

      const entries = reporter.getEntries();
      expect(entries).toHaveLength(5);
      expect(entries[0]!.message).toBe("msg-2");
      expect(entries[4]!.message).toBe("msg-6");
    });

    it("respects custom maxEntries limit", () => {
      const smallReporter = new StorageReporter({ key: "small-logs", maxEntries: 2 });

      smallReporter.report(createEntry(LogLevel.Info, "a"));
      smallReporter.report(createEntry(LogLevel.Info, "b"));
      smallReporter.report(createEntry(LogLevel.Info, "c"));

      const entries = smallReporter.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]!.message).toBe("b");
      expect(entries[1]!.message).toBe("c");

      smallReporter.clear();
    });
  });

  // ── Error Swallowing ────────────────────────────────────────────────────

  describe("error swallowing", () => {
    it("does not throw when localStorage.setItem fails", () => {
      const failingStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: () => null,
      };
      Object.defineProperty(globalThis, "localStorage", {
        value: failingStorage,
        writable: true,
        configurable: true,
      });

      const failReporter = new StorageReporter({ key: "fail-logs" });
      expect(() => failReporter.report(createEntry(LogLevel.Error, "test"))).not.toThrow();
    });

    it("does not throw when localStorage.getItem returns invalid JSON", () => {
      localStorage.setItem("bad-logs", "not-json{{{");
      const badReporter = new StorageReporter({ key: "bad-logs" });
      expect(() => badReporter.report(createEntry(LogLevel.Info, "test"))).not.toThrow();
    });
  });

  // ── clear ───────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("removes all stored entries", () => {
      reporter.report(createEntry(LogLevel.Info, "a"));
      reporter.report(createEntry(LogLevel.Info, "b"));
      reporter.clear();

      const entries = reporter.getEntries();
      expect(entries).toHaveLength(0);
    });

    it("does not throw when localStorage is unavailable", () => {
      const failingStorage = {
        getItem: () => null,
        setItem: vi.fn(),
        removeItem: () => {
          throw new Error("SecurityError");
        },
        clear: vi.fn(),
        length: 0,
        key: () => null,
      };
      Object.defineProperty(globalThis, "localStorage", {
        value: failingStorage,
        writable: true,
        configurable: true,
      });

      const failReporter = new StorageReporter({ key: "fail-clear" });
      expect(() => failReporter.clear()).not.toThrow();
    });
  });

  // ── getEntries ──────────────────────────────────────────────────────────

  describe("getEntries", () => {
    it("returns empty array when no entries exist", () => {
      expect(reporter.getEntries()).toEqual([]);
    });

    it("returns all stored entries", () => {
      reporter.report(createEntry(LogLevel.Info, "one"));
      reporter.report(createEntry(LogLevel.Warn, "two"));

      const entries = reporter.getEntries();
      expect(entries).toHaveLength(2);
    });

    it("returns empty array when storage contains invalid data", () => {
      localStorage.setItem("test-logs", "invalid-json");
      expect(reporter.getEntries()).toEqual([]);
    });
  });

  // ── Level Filtering ─────────────────────────────────────────────────────

  describe("level filtering", () => {
    it("skips entries below configured level", () => {
      const warnReporter = new StorageReporter({
        key: "warn-logs",
        level: LogLevel.Warn,
      });

      warnReporter.report(createEntry(LogLevel.Debug, "debug"));
      warnReporter.report(createEntry(LogLevel.Info, "info"));
      warnReporter.report(createEntry(LogLevel.Warn, "warn"));
      warnReporter.report(createEntry(LogLevel.Error, "error"));

      const entries = warnReporter.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]!.message).toBe("warn");
      expect(entries[1]!.message).toBe("error");

      warnReporter.clear();
    });

    it("getLevel returns configured level", () => {
      expect(reporter.getLevel()).toBe(LogLevel.Debug);
    });

    it("setLevel updates the level", () => {
      reporter.setLevel(LogLevel.Error);
      expect(reporter.getLevel()).toBe(LogLevel.Error);
    });
  });
});
