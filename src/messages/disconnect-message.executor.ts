import {PostboyExecutor} from "../models/postboy-executor";

/**
 * Represents a message signaling a disconnection event. This class is used
 * within the framework to manage and process disconnection notifications.
 * Extends the {@link PostboyExecutor} base class.
 *
 * @extends {PostboyExecutor<void>}
 */
export class DisconnectMessage extends PostboyExecutor<void> {
  static readonly ID = '94579e43-5bc9-4517-bcda-b595bcda1ae7';

  /**
   * Creates an instance of the class with the specified message identifier.
   *
   * @param {string} messageId - The unique identifier for the message.
   */
  constructor(public messageId: string) {
    super();
  }
}
