import { PostboyMiddlewareService } from './postboy-middleware.service';
import { PostboyMessageStore } from './postboy-message.store';
import { PostboyNamespaceStore } from './postboy-namespace.store';

/**
 * Assembles the internal collaborators of a `PostboyService`: its middleware pipeline,
 * message store, and namespace store. The default factories create fresh instances with
 * no shared state; substitute stubs (e.g. in tests) by passing a custom resolver to the
 * `PostboyService` constructor.
 */
export class PostboyDependencyResolver {
  /** Factory for the bus middleware pipeline — one fresh instance per call. */
  getMiddlewareService = () => new PostboyMiddlewareService();

  /** Factory for the message registry — one fresh instance per call. */
  getMessageStore = () => new PostboyMessageStore();

  /** Factory for the namespace registry — one fresh instance per call. */
  getNamespaceStore = () => new PostboyNamespaceStore();
}
