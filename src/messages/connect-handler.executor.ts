import {PostboyExecutor} from "../models/postboy-executor";
import {PostboyExecutionHandler} from "../models/postboy-execution.handler";

/**
 * Represents a connection handler that extends the PostboyExecutor class.
 *
 * This class encapsulates logic associated with executing a handler in a structured way.
 * It is generic and operates on the provided executor and handler types.
 *
 * Type Parameters:
 *   E - Represents an extension of the PostboyExecutor class with a specific type parameter R.
 *   R - Represents the type of the result that the executor is expected to operate on.
 */
export class ConnectHandler<E extends PostboyExecutor<R>, R> extends PostboyExecutor<void> {
  static readonly ID = 'bf618cea-6f32-417c-9548-8eafe937378b';

  /**
   * Constructs an instance of the class.
   *
   * @param {new (...args: any[]) => E} executor - A constructor function for the executor object.
   * @param {PostboyExecutionHandler<R, E>} handler - A handler that processes the execution logic.
   */
  constructor(
   public executor: new (...args: any[]) => E,
   public handler: PostboyExecutionHandler<R, E>
  ) {
    super();
  }
}
