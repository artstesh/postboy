import { PostboyExecutor } from '../models/postboy-executor';
import { MessageType } from '../postboy-abstract.registrator';

/**
 * Infrastructure message that registers a synchronous handler for an executor type.
 *
 * Executing it via `PostboyService.exec` binds the type's static `ID` to the given
 * function: every subsequent `exec` of that executor type invokes it and returns its
 * result. Re-registering the same `ID` logs a warning and overrides the previous
 * registration. The non-deprecated replacement for `PostboyService.recordExecutor`.
 *
 * @template E - The executor type being registered.
 * @template T - The result its handler returns.
 */
export class ConnectExecutor<E extends PostboyExecutor<T>, T> extends PostboyExecutor<void> {
  static readonly ID = 'cb80e8ad-b68c-4b2d-8c44-617ea6017cb3';

  /**
   * @param type - The constructor of the executor class; must declare its own static `ID`.
   * @param exec - The handler invoked with the executor instance on every `exec` of this type.
   */
  constructor(
    public type: MessageType<E>,
    public exec: (e: E) => T,
  ) {
    super();
  }
}
