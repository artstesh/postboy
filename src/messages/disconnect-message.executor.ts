import { PostboyExecutor } from '../models/postboy-executor';

/**
 * Infrastructure message that unregisters a message or executor type from the bus.
 *
 * Executing it via `PostboyService.exec` completes the registered stream (ending every
 * subscriber's subscription), runs the registered completion callbacks — in particular,
 * it completes the result of a fired callback message — and forgets the `ID`, so
 * further `fire`, `sub`, and `exec` for it throw until it is registered again. This is
 * the teardown primitive behind `PostboyAbstractRegistrator.down()`.
 */
export class DisconnectMessage extends PostboyExecutor<void> {
  static readonly ID = '94579e43-5bc9-4517-bcda-b595bcda1ae7';

  /**
   * @param messageId - The static `ID` of the message or executor type to remove — not an instance id.
   */
  constructor(public messageId: string) {
    super();
  }
}
