import { PostboyMiddleware } from '../models/postboy-middleware';
import { PostboyExecutor } from '../models/postboy-executor';

/**
 * Represents a class responsible for removing {@link PostboyMiddleware} in execution flow.
 * This class extends PostboyExecutor and operates with a void return type.
 */
export class RemoveMiddleware extends PostboyExecutor<void> {
  static readonly ID = 'c25c708c-53c9-498d-a28b-936fbaf68b91';

  /**
   * Constructs an instance of the class with the specified middleware.
   *
   * @param {PostboyMiddleware} middleware - The {@link PostboyMiddleware} instance to be removed.
   */
  constructor(public middleware: PostboyMiddleware) {
    super();
  }
}
