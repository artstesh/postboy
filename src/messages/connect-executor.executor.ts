import { PostboyExecutor } from '../models/postboy-executor';
import { MessageType } from '../postboy-abstract.registrator';

/**
 * Registers an executor that connects to a specific type of message handler.
 * This class extends the functionality of `PostboyExecutor` and is designed to manage
 * the execution of a handler defined by a specific message type and an execution function.
 *
 * @template E The type of the executor extending {@link PostboyExecutor}.
 * @template T The return type of the execution function.
 *
 * @extends {PostboyExecutor<void>}
 */
export class ConnectExecutor<E extends PostboyExecutor<T>, T> extends PostboyExecutor<void> {
  static readonly ID = 'cb80e8ad-b68c-4b2d-8c44-617ea6017cb3';

  /**
   * Constructs an instance of the class with the specified type and execution function.
   *
   * @param {MessageType<E>} type - The type of the message.
   * @param {(e: E) => T} exec - The function to be executed with the input of type E that returns a value of type T.
   */
  constructor(
    public type: MessageType<E>,
    public exec: (e: E) => T,
  ) {
    super();
  }
}
