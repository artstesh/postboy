import { PostboyExecutor } from './postboy-executor';

/**
 * Abstract class representing a handler for executing a Postboy task.
 *
 * This class is intended to manage the execution flow of a PostboyExecutor instance.
 * Subclasses must implement the `handle` method, which executes a given PostboyExecutor
 * and returns a result of type R.
 *
 * @template R The type of the result returned by the `handle` method.
 * @template E The type of the executor extending the PostboyExecutor.
 */
export abstract class PostboyExecutionHandler<R, E extends PostboyExecutor<R>> {
  abstract handle(executor: E): R;
}
