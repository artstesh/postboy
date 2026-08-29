import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { NamespaceRegistrator } from './namespace-registrator';
import { PostboyService } from '../postboy.service';

/**
 * The registry of namespaces behind `AddNamespace`/`EliminateNamespace`: maps each name
 * to the registrator managing its registrations.
 */
export class PostboyNamespaceStore {
  private spaces: Map<string, PostboyAbstractRegistrator> = new Map();

  /**
   * Returns the registrator of the given name, creating it on first use.
   *
   * @param space - The unique namespace name.
   * @param postboy - The bus the new registrator executes its registration messages on.
   * @return The registrator of the namespace — the existing one when the name is known.
   */
  public addSpace(space: string, postboy: PostboyService): PostboyAbstractRegistrator {
    if (this.spaces.has(space)) return this.spaces.get(space)!;
    const registrator = new NamespaceRegistrator(postboy);
    this.spaces.set(space, registrator);
    return registrator;
  }

  /**
   * Tears the namespace down — `down()` on its registrator, disconnecting everything it
   * recorded — and removes it. Unknown names are ignored.
   *
   * @param space - The namespace name to remove.
   */
  public eliminateSpace(space: string): void {
    if (!this.spaces.has(space)) return;
    this.spaces.get(space)?.down();
    this.spaces.delete(space);
  }

  /** Tears down every namespace and clears the store; called by `PostboyService.dispose()`. */
  public dispose(): void {
    this.spaces.forEach((space) => space.down());
    this.spaces.clear();
  }
}
