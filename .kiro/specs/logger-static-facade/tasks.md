# Implementation Plan: Logger Static Facade

## Overview

Add a static facade pattern to `LoggerService` so consumers can use
`new Logger('MyService')` without dependency injection. The implementation
modifies `LoggerService` to support dual-mode construction (facade vs config),
adds a static `LoggerManager` reference set during module bootstrap, and wires
fallback logging for pre-initialization use.

## Tasks

- [x] 1. Modify `LoggerService` constructor to support dual-mode operation
  - [x] 1.1 Add static members and refactor constructor
    - Add `static staticManagerRef: LoggerManager | undefined = undefined`
    - Add `static overrideLogger(manager: LoggerManager): void` method
    - Add private static `_fallbackLogger` instance with `ConsoleTransporter`
    - Add private `_mode: 'facade' | 'config'` field
    - Add private `_contextString?: string` field
    - Refactor constructor to accept `LoggerConfig | string | undefined`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 2.4_

  - [ ] 1.2 Write property test for constructor mode selection
    - **Property 1: Constructor mode selection**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ] 1.3 Write property test for overrideLogger
    - **Property 2: overrideLogger sets static reference**
    - **Validates: Requirements 2.3, 2.4**

- [x] 2. Implement facade-mode delegation and fallback behavior
  - [x] 2.1 Add resolveDelegate method and update log methods
    - Add `resolveDelegate(): LoggerService` that returns
      `staticManagerRef.channel()` or `_fallbackLogger`
    - Update `debug`, `info`, `warn`, `error`, `fatal` to check `_mode`
    - In facade mode: resolve delegate, merge contexts, call delegate method
    - In config mode: keep existing `dispatch()` behavior unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2_

  - [ ] 2.2 Write property test for facade delegation with context merging
    - **Property 3: Facade delegation with context merging**
    - **Validates: Requirements 3.1, 3.2**

  - [ ] 2.3 Write property test for config-mode isolation
    - **Property 6: Config-mode isolation**
    - **Validates: Requirements 6.1, 6.2**

- [x] 3. Implement facade-mode context management and accessors
  - [x] 3.1 Update withContext, withoutContext, getTransporters, and getConfig
        for facade mode
    - `withContext` in facade mode: store context locally, merge into delegated
      calls
    - `withoutContext(keys)` in facade mode: remove specified keys from local
      context
    - `withoutContext()` in facade mode: clear all local context
    - `getTransporters` and `getConfig` in facade mode: delegate to resolved
      channel
    - Config-mode behavior for all methods remains unchanged
    - _Requirements: 5.1, 5.2, 5.3, 6.3, 8.1, 8.2, 8.3_

  - [ ] 3.2 Write property test for withContext accumulation
    - **Property 4: Facade withContext accumulation**
    - **Validates: Requirements 5.1**

  - [ ] 3.3 Write property test for withoutContext removal
    - **Property 5: Facade withoutContext removal**
    - **Validates: Requirements 5.2, 5.3**

  - [ ] 3.4 Write property test for facade accessor delegation
    - **Property 7: Facade accessor delegation**
    - **Validates: Requirements 8.1, 8.3**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire static reference in LoggerModule.forRoot()
  - [x] 5.1 Add factory provider in logger.module.ts
    - Add a factory provider to the `forRoot()` providers array
    - Import `LoggerService` in the module file
    - Ensure the factory runs during DI resolution (before `onModuleInit`)
    - _Requirements: 2.2, 7.1, 7.2_

  - [ ] 5.2 Write unit tests for module bootstrap integration
    - Test that `forRoot()` returns a provider that sets `staticManagerRef`
    - _Requirements: 2.2, 7.1, 7.2_

- [x] 6. Update exports in src/index.ts
  - Verify the existing `Logger` alias export works with new constructor
    overloads
  - No changes expected — just confirm it re-exports correctly
  - _Requirements: 1.1, 1.2_

- [x] 7. Update existing tests for backward compatibility
  - [x] 7.1 Update logger.service.test.ts
    - Ensure existing config-mode tests still pass
    - Add example-based tests for facade mode
    - Reset `LoggerService.staticManagerRef = undefined` in `beforeEach`
    - _Requirements: 1.4, 2.1, 3.3, 3.4, 4.1, 4.2, 6.3, 8.2_

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript throughout — all code examples use TypeScript
- `fast-check` needs to be installed as a dev dependency for property-based
  tests
- Existing tests in `__tests__/services/logger.service.test.ts` must continue to
  pass after refactoring
