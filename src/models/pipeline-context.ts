import { PostboyMessage } from './postboy.message';
import { MiddlewareStage } from './middleware-stage.enum';

/**
 * What every middleware hook receives: the running stage plus the message or executor
 * being processed. Filter by `stage` and `message.id` inside `canHandle`.
 */
export interface PipelineContext<T extends PostboyMessage = PostboyMessage> {
  /** The pipeline phase the `before`/`after` hook is running for. */
  stage: MiddlewareStage;
  /** The fired message or the executed executor. */
  message: T;
}
