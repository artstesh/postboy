import { PostboyGenericMessage } from '../models/postboy-generic-message';
import { MessageType } from '../postboy-abstract.registrator';
import { PostboyExecutor } from '../models/postboy-executor';

/**
 * Infrastructure message that locks a message type on the bus.
 *
 * Executing it via `PostboyService.exec` adds the type's static `ID` to the locked set:
 * subsequent `fire()` and `fireCallback()` calls for that type silently skip delivery —
 * subscribers receive nothing — while middleware `before`/`after` hooks still run and
 * `exec()` is unaffected. Registration stays intact, so unlocking resumes delivery
 * immediately. Treat a locked message as a no-op, not an error.
 *
 * @example
 * ```ts
 * postboy.exec(new LockMessage(PingMessage)); // PingMessage stops being delivered
 * postboy.exec(new UnlockMessage(PingMessage)); // delivery resumes
 * ```
 */
export class LockMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = '477df3e2-1f99-4476-9a3b-afd1fa426436';

  /**
   * @param type - The constructor of the message type to lock.
   */
  constructor(public type: MessageType<T>) {
    super();
  }
}
