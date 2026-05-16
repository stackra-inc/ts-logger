# @stackra/ts-logger

Multi-channel logging system for the `@stackra` monorepo. Built on
[consola](https://github.com/unjs/consola) with pluggable reporters, DI
integration, and a dual-mode Logger facade.

## Installation

```bash
pnpm add @stackra/ts-logger
```

## Quick Start

### 1. Register the module

```typescript
import { Module } from "@stackra/ts-container";
import {
  LoggerModule,
  defineConfig,
  ConsoleReporter,
} from "@stackra/ts-logger";

@Module({
  imports: [
    LoggerModule.forRoot(
      defineConfig({
        default: "console",
        channels: {
          console: { reporters: [new ConsoleReporter()] },
        },
      }),
    ),
  ],
})
export class AppModule {}
```

### 2. Use anywhere (facade mode)

```typescript
import { Logger } from "@stackra/ts-logger";

const logger = new Logger("AuthService");
logger.info("User logged in", { userId: "123" });
logger.error("Authentication failed", { reason: "invalid_token" });
```

### 3. Use with DI (decorator mode)

```typescript
import { Injectable } from "@stackra/ts-container";
import { InjectLogger } from "@stackra/ts-logger";
import type { LoggerService } from "@stackra/ts-logger";

@Injectable()
class UserService {
  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    @InjectLogger("errors") private readonly errorLog: LoggerService,
  ) {}

  async createUser(data: UserData): Promise<void> {
    this.logger.info("Creating user", { userId: data.id });
  }
}
```

### 4. Use in React

```tsx
import { useLogger } from "@stackra/ts-logger";

function UserProfile({ userId }: { userId: string }) {
  const logger = useLogger("UserProfile");

  useEffect(() => {
    logger.info("Profile loaded", { userId });
  }, [userId]);

  return <div>...</div>;
}
```

## API

### `LoggerModule.forRoot(config)`

Registers the logger system globally. Config shape:

```typescript
{
  default: "console",           // Default channel name
  channels: {
    console: { reporters: [...], level?: LogLevel, context?: {} },
    errors:  { reporters: [...], level?: LogLevel.Error },
    silent:  { reporters: [new SilentReporter()] },
  },
}
```

### Reporters

| Reporter          | Description                         |
| ----------------- | ----------------------------------- |
| `ConsoleReporter` | Browser DevTools output via consola |
| `StorageReporter` | localStorage persistence            |
| `SilentReporter`  | No-op for testing                   |

### Decorators

| Decorator                 | Purpose                              |
| ------------------------- | ------------------------------------ |
| `@InjectLogger(channel?)` | Inject a LoggerService for a channel |
| `@InjectLoggerManager()`  | Inject the LoggerManager directly    |

### Hooks

| Hook                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `useLogger("Context")` | Get a scoped logger in React   |
| `useLoggerContext()`   | Get the LoggerManager in React |

### Logger Methods

| Method                         | Level                  |
| ------------------------------ | ---------------------- |
| `logger.debug(msg, ctx?)`      | Debug                  |
| `logger.info(msg, ctx?)`       | Info                   |
| `logger.warn(msg, ctx?)`       | Warn                   |
| `logger.error(msg, ctx?)`      | Error                  |
| `logger.fatal(msg, ctx?)`      | Fatal                  |
| `logger.withContext(ctx)`      | Add persistent context |
| `logger.withoutContext(keys?)` | Remove context         |

### Facade

```typescript
import { log } from "@stackra/ts-logger";

log.channel().info("Hello");
log.channel("errors").error("Critical failure");
```
