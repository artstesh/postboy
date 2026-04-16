## Version 3.3.0 — changes in message bus handling

This release continues the move toward a message-driven API for working with the bus. The goal is to keep the public surface cleaner and make bus-related actions more explicit and consistent.

### What changed

#### Message locking and unlocking

You can now lock and unlock message types using dedicated messages:

- `LockMessage`
- `UnlockMessage`

A locked message type can still be registered, but it will not be published until it is unlocked again.

> Direct calls to `lock()` and `unlock()` are now deprecated and will be removed in a future version.

#### Disconnecting messages from processing

`DisconnectMessage` was introduced to completely remove a message from processing.

It accepts a **message ID** and will:

- close all subscriptions for that message;
- prevent it from being published through the bus;
- prevent new subscriptions from being created.

> Direct calls to `unregister(id)` are now deprecated and will be removed in a future version.

#### Middleware management through messages

Middleware management now also follows the message-based model:

- `AddMiddleware`
- `RemoveMiddleware`

This replaces direct calls to `addMiddleware()` and `removeMiddleware()` on `PostboyService`.

#### Unified message connection

`ConnectMessage` replaces the old split between:

- `record()`
- `recordWithPipe()`

Now both cases are handled by the same mechanism:

- if no pipe is needed, connect the subject directly;
- if a pipe is needed, pass it as part of `ConnectMessage`.

### Public API

The following new executors are now exported as part of the public API:

- `AddMiddleware`
- `RemoveMiddleware`
- `LockMessage`
- `UnlockMessage`
- `DisconnectMessage`
- `ConnectMessage`
- `ConnectExecutor`
- `ConnectHandler`
- `AddNamespace`
- `EliminateNamespace`

### Migration notes

Replace direct `PostboyService` calls with message execution:

```typescript 
postboy.exec(new AddMiddleware(middleware));
postboy.exec(new RemoveMiddleware(middleware));
postboy.exec(new LockMessage(MyMessage));
postboy.exec(new UnlockMessage(MyMessage));
postboy.exec(new DisconnectMessage(MyMessage.ID));
postboy.exec(new ConnectMessage(MyMessage, subject));
postboy.exec(new ConnectMessage(MyMessage, subject, pipe));
```


A few practical rules:

- use `ConnectMessage` instead of `record()` and `recordWithPipe()`;
- use `DisconnectMessage` instead of `unregister()`;
- use `AddMiddleware/RemoveMiddleware` instead of `addMiddleware()/removeMiddleware()`;
- use `AddNamespace/EliminateNamespace` instead of `registerNamespace()/unregisterNamespace()`
- use `ConnectExecutor` instead of `recordExecutor()`;
- use `ConnectHandler` instead of `recordHandler();

### Why this change

The idea is to move infrastructure and lifecycle operations into the same event-driven model as message publication itself. That keeps the API more consistent, makes the bus behavior easier to reason about, and reduces direct coupling to `PostboyService` internals.

