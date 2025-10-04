import { PostboyMiddleware } from '../models/postboy-middleware';
import { PostboyMessage } from '../models/postboy.message';

/**
 * A service class that manages middleware functions for processing PostboyMessage objects.
 * It provides methods to add, remove, and execute middlewares in sequence.
 */
export class PostboyMiddlewareService {
  protected middlewares: PostboyMiddleware[] = [];

  /**
   * Adds a middleware function to the collection of middlewares.
   *
   * @param {PostboyMiddleware} middleware - The middleware function to be added.
   * @return {void}
   */
  public addMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Removes a middleware from the list of registered middlewares.
   *
   * @param {PostboyMiddleware} middleware - The middleware instance to be removed.
   * @return {void} No return value.
   */
  public removeMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares = this.middlewares.filter((m) => m !== middleware);
  }

  /**
   * Manages the processing of a PostboyMessage by sequentially applying all middlewares.
   *
   * @param {PostboyMessage} msg - The message object to be processed by the middlewares.
   * @return {void} - This method does not return any value.
   */
  public manage(msg: PostboyMessage): void {
    for (const item of this.middlewares) item.handle(msg);
  }

  /**
   * Disposes of the current object by clearing its middlewares array.
   *
   * @return {void} This method does not return a value.
   */
  public dispose(): void {
    this.middlewares = [];
  }
}
