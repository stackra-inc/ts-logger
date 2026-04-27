# Requirements Document

## Introduction

Add a static facade pattern to `LoggerService` (exported as `Logger`) so that
consumers can use `new Logger('MyService')` without dependency injection. This
follows the NestJS Logger pattern: a static reference to the `LoggerManager` is
set during module bootstrap, and instance methods delegate to the resolved
default channel. The existing DI-powered `LoggerManager` continues to work for
advanced multi-channel use cases.

## Glossary

- **Logger**: The public alias for `LoggerService`, exported as
  `export { LoggerService as Logger }` from the package index.
- **LoggerService**: The consumer-facing logging class that provides `debug`,
  `info`, `warn`, `error`, and `fatal` methods. Currently accepts only
  `LoggerConfig` in its constructor.
- **LoggerManager**: The central orchestrator that manages multiple named
  logging channels. Extends `MultipleInstanceManager`, creates and caches
  `LoggerService` instances per channel.
- **LoggerModule**: The DI module that registers `LoggerManager` and
  configuration providers via `forRoot()`.
- **LoggerConfig**: The configuration interface with optional `transporters` and
  `context` fields.
- **Static_Manager_Reference**: A static property on `LoggerService` that holds
  a reference to the active `LoggerManager` instance, set during module
  initialization.
- **Context_String**: A string identifier (e.g., `'UserService'`) passed to the
  `LoggerService` constructor to label log entries with their origin.
- **Facade_Mode**: The operating mode of a `LoggerService` instance when
  constructed with a `Context_String` instead of a `LoggerConfig`. In
  Facade_Mode, the instance delegates logging calls to the default channel
  resolved from the Static_Manager_Reference.
- **Config_Mode**: The existing operating mode of a `LoggerService` instance
  when constructed with a `LoggerConfig`. The instance uses its own transporters
  directly.
- **Default_Channel**: The channel returned by `LoggerManager.channel()` when no
  channel name is specified, as configured by `LoggerModuleOptions.default`.
- **Fallback_Logger**: A basic `LoggerService` instance with a
  `ConsoleTransporter` that is used when the Static_Manager_Reference has not
  been set and a `LoggerService` is constructed in Facade_Mode.

## Requirements

### Requirement 1: Constructor Overload

**User Story:** As a developer, I want to construct a `Logger` with either a
context string or a config object, so that I can use the logger both inside and
outside of DI contexts.

#### Acceptance Criteria

1. WHEN a `Context_String` is passed to the `LoggerService` constructor, THE
   LoggerService SHALL store the `Context_String` and operate in Facade_Mode.
2. WHEN a `LoggerConfig` object is passed to the `LoggerService` constructor,
   THE LoggerService SHALL operate in Config_Mode using the provided
   transporters, preserving the current behavior.
3. THE LoggerService constructor SHALL distinguish between a `Context_String`
   and a `LoggerConfig` by checking whether the argument is of type `string`.
4. WHEN no arguments are passed to the `LoggerService` constructor, THE
   LoggerService SHALL operate in Facade_Mode with no Context_String.

### Requirement 2: Static Manager Reference

**User Story:** As a framework author, I want to set a static `LoggerManager`
reference on `LoggerService` during module bootstrap, so that facade-mode
instances can resolve channels from the configured manager.

#### Acceptance Criteria

1. THE LoggerService SHALL expose a static property named `staticManagerRef` of
   type `LoggerManager | undefined`, initialized to `undefined`.
2. WHEN `LoggerModule.forRoot()` initializes, THE LoggerModule SHALL set
   `LoggerService.staticManagerRef` to the instantiated `LoggerManager`
   instance.
3. THE LoggerService SHALL expose a static method `overrideLogger` that accepts
   a `LoggerManager` instance and sets the Static_Manager_Reference.
4. WHEN `overrideLogger` is called with a `LoggerManager` instance, THE
   LoggerService SHALL replace the current Static_Manager_Reference with the
   provided instance.

### Requirement 3: Facade-Mode Delegation

**User Story:** As a developer, I want facade-mode logger instances to delegate
log calls to the default channel from the manager, so that all configured
transporters and formatting are applied.

#### Acceptance Criteria

1. WHEN a Facade_Mode LoggerService instance calls `debug`, `info`, `warn`,
   `error`, or `fatal`, THE LoggerService SHALL resolve the Default_Channel from
   the Static_Manager_Reference and delegate the call to that channel's
   corresponding method.
2. WHEN a Facade_Mode LoggerService instance has a Context_String, THE
   LoggerService SHALL merge `{ context: Context_String }` into the context
   parameter of each delegated log call.
3. WHILE the Static_Manager_Reference is `undefined`, THE LoggerService in
   Facade_Mode SHALL use the Fallback_Logger to handle log calls.
4. WHEN the Static_Manager_Reference is set after a Facade_Mode instance was
   created, THE LoggerService SHALL begin delegating to the manager on the next
   log call without requiring re-instantiation.

### Requirement 4: Fallback Logger Behavior

**User Story:** As a developer, I want the logger to work with sensible defaults
before the module is initialized, so that early startup logging is not lost.

#### Acceptance Criteria

1. WHILE the Static_Manager_Reference is `undefined`, THE Fallback_Logger SHALL
   use a single `ConsoleTransporter` with default settings.
2. WHEN the Static_Manager_Reference becomes available, THE LoggerService in
   Facade_Mode SHALL stop using the Fallback_Logger and begin delegating to the
   Static_Manager_Reference on the next log call.

### Requirement 5: Context Propagation in Facade Mode

**User Story:** As a developer, I want `withContext` and `withoutContext` to
work in facade mode, so that I can add persistent context to my logger
instances.

#### Acceptance Criteria

1. WHEN `withContext` is called on a Facade_Mode LoggerService instance, THE
   LoggerService SHALL store the provided context and merge it into every
   subsequent delegated log call alongside the Context_String.
2. WHEN `withoutContext` is called on a Facade_Mode LoggerService instance with
   specific keys, THE LoggerService SHALL remove those keys from the stored
   context.
3. WHEN `withoutContext` is called on a Facade_Mode LoggerService instance
   without arguments, THE LoggerService SHALL clear all stored context except
   the Context_String.

### Requirement 6: Config-Mode Backward Compatibility

**User Story:** As an existing user, I want the current `LoggerService` behavior
to remain unchanged when constructed with a `LoggerConfig`, so that my existing
code continues to work.

#### Acceptance Criteria

1. WHEN a `LoggerConfig` is passed to the `LoggerService` constructor, THE
   LoggerService SHALL use the provided transporters directly, ignoring the
   Static_Manager_Reference.
2. WHEN a `LoggerConfig` with a `context` field is passed, THE LoggerService
   SHALL use that context as shared context, preserving the current behavior.
3. THE LoggerService in Config_Mode SHALL continue to support `withContext`,
   `withoutContext`, `getTransporters`, and `getConfig` with identical behavior
   to the current implementation.

### Requirement 7: Module Bootstrap Integration

**User Story:** As a framework author, I want the `LoggerModule` to
automatically wire the static reference during initialization, so that no manual
setup is required.

#### Acceptance Criteria

1. WHEN `LoggerModule.forRoot()` creates the `DynamicModule`, THE LoggerModule
   SHALL include a factory provider that sets `LoggerService.staticManagerRef`
   to the `LoggerManager` instance after the manager is created.
2. THE LoggerModule SHALL set the Static_Manager_Reference before the
   `LoggerManager.onModuleInit` lifecycle hook completes.

### Requirement 8: Transporter Access in Facade Mode

**User Story:** As a developer, I want to access transporters and configuration
from a facade-mode logger, so that I can inspect the active logging setup.

#### Acceptance Criteria

1. WHEN `getTransporters` is called on a Facade_Mode LoggerService instance
   while the Static_Manager_Reference is set, THE LoggerService SHALL return the
   transporters from the Default_Channel.
2. WHEN `getTransporters` is called on a Facade_Mode LoggerService instance
   while the Static_Manager_Reference is `undefined`, THE LoggerService SHALL
   return the Fallback_Logger transporters.
3. WHEN `getConfig` is called on a Facade_Mode LoggerService instance while the
   Static_Manager_Reference is set, THE LoggerService SHALL return the config
   from the Default_Channel.
