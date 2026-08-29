import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyMiddleware } from '../services/postboy-middleware';

/**
 * Infrastructure message that removes a {@link PostboyMiddleware} from the pipeline.
 *
 * Executing it via `PostboyService.exec` drops the instance from the chain — matched by
 * identity, not by name or class — and calls its `dispose()` hook. Pass the very same
 * instance that was added via `AddMiddleware`.
 */
export class RemoveMiddleware extends PostboyExecutor<void> {
  static readonly ID = 'c25c708c-53c9-498d-a28b-936fbaf68b91';

  /**
   * @param middleware - The middleware instance previously added via `AddMiddleware`.
   */
  constructor(public middleware: PostboyMiddleware) {
    super();
  }
}
