import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyExecutionHandler } from '../models/postboy-execution.handler';

/**
 * Infrastructure message that registers a {@link PostboyExecutionHandler} for an
 * executor type.
 *
 * Executing it via `PostboyService.exec` binds the executor class's static `ID` to the
 * handler: every subsequent `exec` of that type calls `handler.handle(...)` and returns
 * its result. Re-registering the same `ID` logs a warning and overrides the previous
 * registration. The non-deprecated replacement for `PostboyService.recordHandler`.
 *
 * @template E - The executor type being served.
 * @template R - The result its handler returns.
 */
export class ConnectHandler<E extends PostboyExecutor<R>, R> extends PostboyExecutor<void> {
  static readonly ID = 'bf618cea-6f32-417c-9548-8eafe937378b';

  /**
   * @param executor - The constructor of the executor class; must declare its own static `ID`.
   * @param handler - The handler whose `handle` method receives the executor.
   */
  constructor(
    public executor: new (...args: any[]) => E,
    public handler: PostboyExecutionHandler<R, E>,
  ) {
    super();
  }
}
