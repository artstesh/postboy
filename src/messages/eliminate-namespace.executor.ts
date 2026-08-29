import { PostboyExecutor } from '../models/postboy-executor';

/**
 * Infrastructure message that tears down a namespace created by `AddNamespace`.
 *
 * Executing it via `PostboyService.exec` calls `down()` on the namespace's registrator —
 * disconnecting every message and executor it recorded — and removes the namespace.
 * Eliminating an unknown name changes nothing.
 */
export class EliminateNamespace extends PostboyExecutor<void> {
  static readonly ID = '03bb03bb-53e0-4b74-9aad-64d5c54a8972';

  /**
   * @param space - The name the namespace was created with.
   */
  constructor(public space: string) {
    super();
  }
}
