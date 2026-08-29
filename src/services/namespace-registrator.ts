import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { PostboyService } from '../postboy.service';

/**
 * The concrete registrator created for each namespace by `PostboyNamespaceStore.addSpace`:
 * a plain {@link PostboyAbstractRegistrator} with no registration logic of its own —
 * everything is recorded on it through the public `record*` methods.
 */
export class NamespaceRegistrator extends PostboyAbstractRegistrator {
  constructor(postboy: PostboyService) {
    super(postboy);
  }

  /** No-op: namespaces record via the public `record*` methods, not in the `up()` hook. */
  protected _up(): void {
    // ignore
  }
}
