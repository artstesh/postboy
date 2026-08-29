import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyGenericMessage } from '../models/postboy-generic-message';
import { MessageType } from '../postboy-abstract.registrator';
import { Observable, Subject } from 'rxjs';

/**
 * Infrastructure message that registers a pub/sub message type on the bus.
 *
 * Executing it via `PostboyService.exec` binds the type's static `ID` to the given
 * subject: `sub()` and `once()` start returning its (piped) stream, and `fire()`
 * delivers into it. Re-registering the same `ID` logs a warning and overrides the
 * previous registration. The non-deprecated replacement for the `PostboyService.record*`
 * methods.
 *
 * @example
 * ```ts
 * postboy.exec(new ConnectMessage(PingMessage, new Subject<PingMessage>()));
 * // with a pipe — subscribers see the transformed stream
 * postboy.exec(new ConnectMessage(PingMessage, new Subject<PingMessage>(), (s) => s.pipe(share())));
 * ```
 */
export class ConnectMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = 'aa03a192-bdc7-402d-9f2f-bf3748229ea2';

  /**
   * @param type - The constructor of the message type; must declare its own static `ID`.
   * @param sub - The subject the message type is served from.
   * @param pipe - Optional wrapper producing the observable subscribers receive, e.g. to apply operators.
   */
  constructor(
    public type: MessageType<T>,
    public sub: Subject<T>,
    public pipe?: (s: Subject<T>) => Observable<T>,
  ) {
    super();
  }
}
