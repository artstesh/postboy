import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {PostboyExecutor} from "../models/postboy-executor";
import {MessageType} from "../postboy-abstract.registrator";

/**
 * A specialized executor that handles the unlocking process for messages of a specified type.
 * Unlocks a previously locked message, making it available for processing again.
 *
 * @deprecated Use {@link PostboyMiddleware}
 * @template T - The type parameter extending {@link PostboyGenericMessage}, representing the message type handled by the executor.
 * @extends {PostboyExecutor<void>}
 */
export class UnlockMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = 'd71d25e3-90ac-4009-b972-9e6c6b05611e';

  /**
   * Creates an instance of the class with the specified message type.
   *
   * @param {MessageType<T>} type - The message type for this instance.
   */
  constructor(public type: MessageType<T>) {
    super();
  }
}
