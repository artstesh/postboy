import { PostboyMessage } from './postboy.message';

/**
 * Base class for synchronous commands executed via `PostboyService.exec`.
 *
 * An executor is a short-lived value object: construct it with the command arguments and
 * pass it to `exec`, which invokes the handler registered for the class's static `ID`
 * and returns its result synchronously. For asynchronous results use a
 * {@link PostboyCallbackMessage} instead.
 *
 * @example
 * ```ts
 * class GetDataExecutor extends PostboyExecutor<string> {
 *   static readonly ID = 'app.get-data';
 *   constructor(public key: string) {
 *     super();
 *   }
 * }
 *
 * postboy.exec(new ConnectExecutor(GetDataExecutor, (e) => store.get(e.key)));
 * const value: string = postboy.exec(new GetDataExecutor('foo'));
 * ```
 */
export abstract class PostboyExecutor<T> extends PostboyMessage {
  /**
   * Phantom marker existing only at the type level: it ties the class to its result type
   * `T` so `exec` can infer it. Erased at runtime — never assign to it.
   */
  declare protected readonly _postboyResultType?: T;
}
