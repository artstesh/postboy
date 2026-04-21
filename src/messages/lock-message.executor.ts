import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {MessageType} from "../postboy-abstract.registrator";
import {PostboyExecutor} from "../models/postboy-executor";

/**
 * Locks a specific message type to prevent firing of them.
 *
 * This class is used to handle operations associated with locking mechanisms
 * for a specified message type.
 *
 * @template T - A type that extends {@link PostboyGenericMessage}.
 */
export class LockMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = '477df3e2-1f99-4476-9a3b-afd1fa426436';

  /**
   * Constructs an instance of the class with the specified message type.
   *
   * @param {MessageType<T>} type - The type of the message to be used for the instance.
   */
  constructor(public type: MessageType<T>) {
    super();
  }
}
