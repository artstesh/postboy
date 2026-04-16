import { PostboyMiddlewareService } from './postboy-middleware.service';
import { PostboyMessageStore } from './postboy-message.store';
import { PostboyNamespaceStore } from './postboy-namespace.store';
import { PostboyService } from '../postboy.service';
import { PostboyContextService } from './postboy-context.service';

export class PostboyDependencyResolver {
  /**
   * Retrieves an instance of the PostboyMiddlewareService.
   *
   * This function initializes and returns a new instance of the
   * PostboyMiddlewareService, which can be used to configure and manage
   * middleware for a specific module or application.
   *
   * @returns {PostboyMiddlewareService} A new instance of PostboyMiddlewareService.
   */
  getMiddlewareService = () => new PostboyMiddlewareService();
  /**
   * A function that instantiates and returns a new instance of PostboyMessageStore.
   *
   * This function serves as a factory method for creating instances
   * of the PostboyMessageStore class.
   *
   * @returns {PostboyMessageStore} A new instance of the PostboyMessageStore class.
   */
  getMessageStore = () => new PostboyMessageStore();
  /**
   * Creates and initializes a new instance of PostboyNamespaceStore using the provided PostboyService instance.
   *
   * @function getNamespaceStore
   * @returns {PostboyNamespaceStore} A new instance of PostboyNamespaceStore associated with the given PostboyService.
   */
  getNamespaceStore = () => new PostboyNamespaceStore();
  /**
   * A factory function that creates an instance of PostboyContextService.
   *
   * @param {boolean} active - Determines whether the created PostboyContextService instance is active.
   * @returns {PostboyContextService} A new instance of PostboyContextService with the specified active state.
   */
  getPostboyContextService = (active: boolean) => new PostboyContextService(active);
}
