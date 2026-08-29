import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { PostboyExecutor } from '../models/postboy-executor';

/**
 * Infrastructure message that creates — or returns the existing — registrator of a
 * namespace.
 *
 * Executing it via `PostboyService.exec` registers the given name in the namespace
 * store and returns the {@link PostboyAbstractRegistrator} for it: record messages and
 * executors on that registrator, then tear them all down at once with
 * `EliminateNamespace` (or the registrator's own `down()`). Executing it again with the
 * same name returns the same registrator without recreating it.
 *
 * @example
 * ```ts
 * const reg = postboy.exec(new AddNamespace('feature-a'));
 * reg.recordSubject(PingMessage);
 * // later: postboy.exec(new EliminateNamespace('feature-a')); — disconnects everything recorded
 * ```
 */
export class AddNamespace extends PostboyExecutor<PostboyAbstractRegistrator> {
  static readonly ID = '6d1a6f7d-6b6e-4c4d-8af8-9cc9a32e850c';

  /**
   * @param space - The unique name of the namespace.
   */
  constructor(public space: string) {
    super();
  }
}
