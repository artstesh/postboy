import { PostboyAbstractRegistrator } from '../postboy-abstract.registrator';
import { NamespaceRegistrator } from './namespace-registrator';
import { PostboyService } from '../postboy.service';

/**
 * Represents a store for managing namespaces in the Postboy system.
 * Provides functionality to add, eliminate, and dispose namespaces.
 */
export class PostboyNamespaceStore {
  private spaces: Map<string, PostboyAbstractRegistrator> = new Map();

  /**
   * Adds a new space or retrieves an existing one if it already exists.
   *
   * @param {string} space - The name of the space to add or retrieve.
   * @param {PostboyService} postboy - The PostboyService instance used to create a namespace registrator.
   * @return {PostboyAbstractRegistrator} The registrator associated with the specified space.
   */
  public addSpace(space: string, postboy: PostboyService): PostboyAbstractRegistrator {
    if (this.spaces.has(space)) return this.spaces.get(space)!;
    const registrator = new NamespaceRegistrator(postboy);
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
