/**
 * @fileoverview Logger Demo Page — interactive showcase of all logging features.
 *
 * Uses HeroUI Tabs to organize demos into sections. Each section
 * demonstrates a specific feature of the logger package with live
 * interactive examples.
 *
 * @module @stackra/react-logger
 * @category Demo
 */

"use client";

import { useState, useCallback, useRef, type ReactElement } from "react";
import { Button, Chip, Tabs, Card, Switch, Input } from "@heroui/react";
import { Segment } from "@heroui-pro/react";

/* ── Types ────────────────────────────────────────────────────── */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "default",
  info: "accent",
  warn: "warning",
  error: "danger",
};

/**
 * Main demo page for the logger package.
 */
export function DemoLoggerPage(): ReactElement {
  const [activeTab, setActiveTab] = useState("hook");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground mb-2">Logger Demo</h1>
        <p className="text-sm text-default-500">
          Interactive showcase of <code className="text-foreground">@stackra/react-logger</code>.
          Structured logging with levels, channels, context enrichment, and performance timing.
        </p>
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
        aria-label="Logger Demo Sections"
      >
        <Tabs.List>
          <Tabs.Tab id="hook">useLogger Hook</Tabs.Tab>
          <Tabs.Tab id="levels">Log Levels</Tabs.Tab>
          <Tabs.Tab id="channels">Channels</Tabs.Tab>
          <Tabs.Tab id="structured">Structured Logging</Tabs.Tab>
          <Tabs.Tab id="context">Context Enrichment</Tabs.Tab>
          <Tabs.Tab id="performance">Performance Timing</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel id="hook">
          <UseLoggerDemo />
        </Tabs.Panel>
        <Tabs.Panel id="levels">
          <LogLevelsDemo />
        </Tabs.Panel>
        <Tabs.Panel id="channels">
          <ChannelsDemo />
        </Tabs.Panel>
        <Tabs.Panel id="structured">
          <StructuredLoggingDemo />
        </Tabs.Panel>
        <Tabs.Panel id="context">
          <ContextEnrichmentDemo />
        </Tabs.Panel>
        <Tabs.Panel id="performance">
          <PerformanceTimingDemo />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

/* ── Section: useLogger Hook ──────────────────────────────────── */

function UseLoggerDemo(): ReactElement {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState("User clicked button");

  const log = (level: LogLevel, msg: string) => {
    setLogs((prev) => [
      ...prev.slice(-9),
      {
        level,
        message: msg,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">useLogger() Hook</h2>
      <p className="text-sm text-default-500 mb-4">
        Access the logger instance via <code>useLogger()</code>. Provides <code>debug</code>,{" "}
        <code>info</code>, <code>warn</code>, and <code>error</code> methods.
      </p>

      <div className="flex gap-3 mb-4">
        <Input label="Message" value={message} onValueChange={setMessage} className="flex-1" />
      </div>

      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="secondary" onPress={() => log("debug", message)}>
          debug()
        </Button>
        <Button size="sm" variant="secondary" onPress={() => log("info", message)}>
          info()
        </Button>
        <Button size="sm" color="warning" variant="secondary" onPress={() => log("warn", message)}>
          warn()
        </Button>
        <Button size="sm" color="danger" variant="secondary" onPress={() => log("error", message)}>
          error()
        </Button>
      </div>

      <div className="rounded-lg bg-default-50 p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <span className="text-default-400">Log entries will appear here...</span>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-default-400">{entry.timestamp}</span>
              <Chip size="sm" color={LEVEL_COLORS[entry.level] as any}>
                {entry.level.toUpperCase()}
              </Chip>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

/* ── Section: Log Levels ──────────────────────────────────────── */

function LogLevelsDemo(): ReactElement {
  const [minLevel, setMinLevel] = useState<LogLevel>("debug");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  const levelPriority: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  const emitAll = () => {
    const entries: LogEntry[] = levels.map((level) => ({
      level,
      message: `This is a ${level} message`,
      timestamp: new Date().toLocaleTimeString(),
    }));
    setLogs(entries);
  };

  const visibleLogs = logs.filter((l) => levelPriority[l.level] >= levelPriority[minLevel]);

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">Log Level Filtering</h2>
      <p className="text-sm text-default-500 mb-4">
        Set a minimum log level. Messages below the threshold are suppressed.
      </p>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-default-500">Min level:</span>
        <Segment
          value={minLevel}
          onValueChange={(v) => setMinLevel(v as LogLevel)}
          aria-label="Min level"
        >
          <Segment.Item value="debug">Debug</Segment.Item>
          <Segment.Item value="info">Info</Segment.Item>
          <Segment.Item value="warn">Warn</Segment.Item>
          <Segment.Item value="error">Error</Segment.Item>
        </Segment>
      </div>

      <Button variant="primary" onPress={emitAll} className="mb-4">
        Emit All Levels
      </Button>

      <div className="rounded-lg bg-default-50 p-4 space-y-1">
        {logs.length === 0 ? (
          <span className="text-xs text-default-400">
            Click "Emit All Levels" to see filtering...
          </span>
        ) : (
          <>
            <div className="text-xs text-default-500 mb-2">
              Showing {visibleLogs.length}/{logs.length} (min: {minLevel})
            </div>
            {visibleLogs.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <Chip size="sm" color={LEVEL_COLORS[entry.level] as any}>
                  {entry.level}
                </Chip>
                <span>{entry.message}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}

/* ── Section: Channels ────────────────────────────────────────── */

function ChannelsDemo(): ReactElement {
  const [channel, setChannel] = useState("console");
  const [output, setOutput] = useState<string[]>([]);

  const sendLog = () => {
    const msg = `[${new Date().toLocaleTimeString()}] Info: User action logged`;
    switch (channel) {
      case "console":
        setOutput((prev) => [...prev.slice(-7), `📺 [console] ${msg}`]);
        break;
      case "silent":
        setOutput((prev) => [...prev.slice(-7), `🔇 [silent] (suppressed) ${msg}`]);
        break;
      case "custom":
        setOutput((prev) => [...prev.slice(-7), `🔌 [custom → remote API] ${msg}`]);
        break;
    }
  };

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">Log Channels</h2>
      <p className="text-sm text-default-500 mb-4">
        Route logs to different channels: console (default), silent (testing), or custom (remote
        services).
      </p>

      <div className="mb-4">
        <Segment value={channel} onValueChange={setChannel} aria-label="Channel">
          <Segment.Item value="console">Console</Segment.Item>
          <Segment.Item value="silent">Silent</Segment.Item>
          <Segment.Item value="custom">Custom (API)</Segment.Item>
        </Segment>
      </div>

      <Button variant="primary" onPress={sendLog} className="mb-4">
        Send Log
      </Button>

      <div className="rounded-lg bg-default-50 p-4 font-mono text-xs max-h-48 overflow-y-auto">
        {output.length === 0 ? (
          <span className="text-default-400">Select a channel and send a log...</span>
        ) : (
          output.map((entry, i) => (
            <div key={i} className="py-0.5">
              {entry}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

/* ── Section: Structured Logging ──────────────────────────────── */

function StructuredLoggingDemo(): ReactElement {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const logStructured = () => {
    const entry: LogEntry = {
      level: "info",
      message: "Order processed",
      timestamp: new Date().toISOString(),
      meta: {
        orderId: `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        userId: "usr_abc123",
        amount: Math.floor(Math.random() * 500) + 50,
        currency: "USD",
      },
    };
    setLogs((prev) => [...prev.slice(-4), entry]);
  };

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">Structured Logging</h2>
      <p className="text-sm text-default-500 mb-4">
        Attach structured metadata to log entries for machine-readable output. Useful for log
        aggregation services.
      </p>

      <Button variant="primary" onPress={logStructured} className="mb-4">
        Log Structured Entry
      </Button>

      <div className="space-y-3">
        {logs.map((entry, i) => (
          <div key={i} className="rounded-lg bg-default-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Chip size="sm" color="accent">
                INFO
              </Chip>
              <span className="text-sm font-medium">{entry.message}</span>
              <span className="text-xs text-default-400 ml-auto">{entry.timestamp}</span>
            </div>
            <pre className="text-xs font-mono text-default-600">
              {JSON.stringify(entry.meta, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Section: Context Enrichment ──────────────────────────────── */

function ContextEnrichmentDemo(): ReactElement {
  const [context, setContext] = useState<Record<string, string>>({
    requestId: "req_001",
    service: "auth",
  });
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const addContext = () => {
    if (newKey) {
      setContext((prev) => ({ ...prev, [newKey]: newValue }));
      setNewKey("");
      setNewValue("");
    }
  };

  const logWithContext = () => {
    const entry = `info: "Request handled" ${JSON.stringify(context)}`;
    setLogs((prev) => [...prev.slice(-5), entry]);
  };

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">Context Enrichment</h2>
      <p className="text-sm text-default-500 mb-4">
        Attach persistent context to all log entries. Context is inherited by child loggers.
      </p>

      <div className="flex gap-2 mb-4">
        <Input label="Key" value={newKey} onValueChange={setNewKey} className="flex-1" />
        <Input label="Value" value={newValue} onValueChange={setNewValue} className="flex-1" />
        <Button variant="secondary" onPress={addContext}>
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(context).map(([k, v]) => (
          <Chip key={k} size="sm" variant="soft">
            {k}: {v}
          </Chip>
        ))}
      </div>

      <Button variant="primary" onPress={logWithContext} className="mb-4">
        Log with Context
      </Button>

      <div className="rounded-lg bg-default-50 p-4 font-mono text-xs space-y-1">
        {logs.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </Card>
  );
}

/* ── Section: Performance Timing ──────────────────────────────── */

function PerformanceTimingDemo(): ReactElement {
  const [timings, setTimings] = useState<Array<{ label: string; duration: number }>>([]);
  const startRef = useRef<number>(0);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("database.query");

  const startTimer = () => {
    startRef.current = performance.now();
    setRunning(true);
  };

  const stopTimer = () => {
    const duration = Math.round(performance.now() - startRef.current);
    setTimings((prev) => [...prev.slice(-7), { label, duration }]);
    setRunning(false);
  };

  const simulateOperation = () => {
    startRef.current = performance.now();
    setRunning(true);
    const delay = Math.floor(Math.random() * 300) + 50;
    setTimeout(() => {
      const duration = Math.round(performance.now() - startRef.current);
      setTimings((prev) => [...prev.slice(-7), { label, duration }]);
      setRunning(false);
    }, delay);
  };

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg font-bold mb-4">Performance Timing</h2>
      <p className="text-sm text-default-500 mb-4">
        Measure operation duration with <code>logger.time()</code> and <code>logger.timeEnd()</code>
        . Automatically logs elapsed time.
      </p>

      <div className="flex gap-3 mb-4">
        <Input label="Timer Label" value={label} onValueChange={setLabel} className="flex-1" />
        <Button variant="primary" onPress={simulateOperation} isLoading={running}>
          Simulate Operation
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="secondary" onPress={startTimer} isDisabled={running}>
          time()
        </Button>
        <Button size="sm" variant="secondary" onPress={stopTimer} isDisabled={!running}>
          timeEnd()
        </Button>
      </div>

      {timings.length > 0 && (
        <div className="rounded-lg bg-default-50 p-4 space-y-2">
          {timings.map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="font-mono text-default-500">{t.label}</span>
              <Chip
                size="sm"
                color={t.duration < 100 ? "success" : t.duration < 200 ? "warning" : "danger"}
              >
                {t.duration}ms
              </Chip>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
