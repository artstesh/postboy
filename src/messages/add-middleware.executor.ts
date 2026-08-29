import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyMiddleware } from '../services/postboy-middleware';

/**
 * Infrastructure message that appends a {@link PostboyMiddleware} to the pipeline.
 *
 * Executing it via `PostboyService.exec` adds the middleware to the end of the chain:
 * hooks then run for every stage its `canHandle` accepts, in insertion order. Adding
 * the same instance twice makes its hooks run twice.
 *
 * @example
 * ```ts
 * postboy.exec(new AddMiddleware(new LoggingMiddleware()));
 * ```
 */
export class AddMiddleware extends PostboyExecutor<void> {
  static readonly ID = '0a8cfe0a-6193-4082-8440-d0793367b21d';

  /**
   * @param middleware - The middleware instance to append.
   */
  constructor(public middleware: PostboyMiddleware) {
    super();
  }
}
