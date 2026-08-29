import { PostboyExecutor } from './postboy-executor';

/**
 * Base class for class-based executor handlers — the object-oriented alternative to the
 * `(e) => result` function accepted by `ConnectExecutor`.
 *
 * Register an instance with `ConnectHandler` (or `PostboyAbstractRegistrator.recordHandler`);
 * {@link handle} is then invoked on every `PostboyService.exec` of the executor type.
 *
 * @template R - Result type returned by {@link handle}.
 * @template E - The executor type this handler serves.
 */
export abstract class PostboyExecutionHandler<R, E extends PostboyExecutor<R>> {
  /**
   * Processes an executor command and returns its result synchronously.
   *
   * @param executor - The executor instance passed to `PostboyService.exec`.
   * @return The result handed back to the caller of `exec`.
   */
  abstract handle(executor: E): R;
}
