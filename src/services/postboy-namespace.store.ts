import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { NamespaceRegistrator } from './namespace-registrator';
import { PostboyService } from '../postboy.service';

/**
 * Represents a store for managing namespaces in the Postboy system.
 * Provides functionality to add, eliminate, and dispose namespaces.
 */
export class PostboyNamespaceStore {
  private spaces: Map<string, PostboyAbstractRegistrator> = new Map();

  constructor(private postboy: PostboyService) {}

  /**
   * Adds a new namespace to the registry.
   *
   * @param {string} space - The name of the namespace to add or retrieve.
   * @return {PostboyAbstractRegistrator} An instance of the registrator corresponding to the specified namespace.
   */
  public addSpace(space: string): PostboyAbstractRegistrator {
    if (this.spaces.has(space)) return this.spaces.get(space)!;
    const registrator = new NamespaceRegistrator(this.postboy);
    this.spaces.set(space, registrator);
    return registrator;
  }

  /**
   * Removes a specified space from the spaces collection if it exists.
   * If the space exists, it will be deleted after invoking its down method.
   *
   * @param {string} space - The name of the space to be removed.
   * @return {void} This method does not return a value.
   */
  public eliminateSpace(space: string): void {
    if (!this.spaces.has(space)) return;
    this.spaces.get(space)?.down();
    this.spaces.delete(space);
  }

  /**
   * Disposes of the current instance by performing cleanup operations.
   * Iterates through all spaces, performs a "down" operation on each,
   * and then clears the collection of spaces.
   *
   * @return {void} No return value.
   */
  public dispose(): void {
    this.spaces.forEach((space) => space.down());
    this.spaces.clear();
  }
}
