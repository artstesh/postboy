import { PostboyGenericMessage } from '../models/postboy-generic-message';
import { PostboyExecutor } from '../models/postboy-executor';
import { MessageType } from '../postboy-abstract.registrator';

/**
 * Infrastructure message that unlocks a message type locked by `LockMessage`.
 *
 * Executing it via `PostboyService.exec` removes the type's static `ID` from the locked
 * set, so `fire()` and `fireCallback()` deliver it again. Unlocking a type that was
 * never locked changes nothing.
 */
export class UnlockMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = 'd71d25e3-90ac-4009-b972-9e6c6b05611e';

  /**
   * @param type - The constructor of the message type to unlock.
   */
  constructor(public type: MessageType<T>) {
    super();
  }
}
