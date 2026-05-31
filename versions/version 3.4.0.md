# Library 3.4 — Middleware Pipeline Overhaul

Version 3.4 introduces a new middleware pipeline model that replaces the previous single-step middleware handling with a stage-based lifecycle. This change makes middleware more expressive, enables cancellation at specific stages, and provides better control over post-processing and error handling.

## What changed

### 1. Middleware now works as a pipeline with stages
Middleware execution is now split into explicit stages:

- `Publish`
- `Callback`
- `Execute`

For each stage, middleware can run:

- before the stage
- after the stage
- on error

This gives middleware authors much finer-grained control over how messages and executors are processed.

### 2. Middleware can now interrupt processing
A middleware can now stop the operation by returning an interrupt decision during the `before` phase.

This is especially useful when:

- validating input before publish/execute
- blocking message processing based on runtime conditions
- enforcing cross-cutting rules consistently

### 3. Middleware context is now richer
Middleware receives a structured pipeline context containing:

- the current stage
- the current message or executor
- optional message context metadata

This makes it easier to implement middleware that reacts differently depending on the operation being performed.

### 4. New cancellation details
The library now exposes structured cancellation information, including:

- stage
- cancelling middleware
- message ID
- namespace
- reason

This improves diagnostics and helps identify why an operation was stopped.

### 5. Updated middleware API
The middleware abstraction has been redesigned to support:

- `canHandle(...)`
- `before(...)`
- `after(...)`
- `dispose()`

This replaces the older simpler middleware contract and aligns middleware behavior with the new pipeline model.

### 6. Compatibility and API cleanup
Some previously available convenience methods were removed from the public service API in favor of the message-driven approach already used elsewhere in the library.

In addition, message locking and middleware registration now rely on the updated middleware infrastructure.

## Motivation

This update was made to improve extensibility and make the middleware system more predictable and maintainable.

The previous approach was limited because middleware could only act as a single, generic interception point. With the new pipeline model, middleware can now:

- distinguish between publishing, callback handling, and execution
- react before and after each stage
- cancel processing in a controlled way
- be composed more cleanly across the library

This is a foundation for richer cross-cutting behavior in future versions.

## Migration notes

If you use custom middleware, you will need to update it to the new middleware contract.

### Required changes for custom middleware

1. Replace the old middleware implementation with the new abstract middleware base class.
2. Implement the new lifecycle methods:
   - `canHandle`
   - `before`
   - `after`
3. Use the provided pipeline context to determine which stage is being processed.
4. If you want to stop processing, return the interrupt decision from `before`.

### Behavior changes to review

- Middleware no longer behaves as a single generic hook.
- Logic that previously ran for every operation should now be moved to the appropriate stage.
- If your code depended on legacy service methods for lock/unlock, namespace management, middleware registration, or unregistering items directly, switch to the newer message-driven flow used by the library.

### Recommended migration approach

- Review each custom middleware and map its logic to the new stages.
- Move validation logic to `before`.
- Move side effects and logging to `after`.
- Test publishing, callbacks, and execution separately to confirm the middleware still behaves as expected.

## Notes

- Documentation was updated to reflect the new model.
- Tests were added/updated to cover the new middleware behavior.
