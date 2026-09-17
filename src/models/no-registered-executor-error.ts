import { PostboyError } from './postboy-error';

/**
 * The error thrown when an executor type is executed that was never registered with the bus —
 * a `ConnectExecutor`/`ConnectHandler` for its static `ID` was not executed.
 *
 * Thrown by `PostboyService.exec`. Distinguish it from other errors via
 * `error instanceof NoRegisteredExecutorError` or the {@link isPostboyError} guard, then inspect
 * {@link id} to find the missing registration.
 */
export class NoRegisteredExecutorError extends PostboyError {
  /** The static `ID` the executor was looked up under. */
  public readonly id: string;

  /**
   * @param id - The static `ID` the executor was looked up under; becomes part of the error message.
   */
  constructor(id: string) {
    super(`There is no registered executor with id ${id}`);
    this.name = 'PostboyNoRegisteredExecutorError';
    this.id = id;
  }
}
