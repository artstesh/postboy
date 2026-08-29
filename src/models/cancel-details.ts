import { MiddlewareStage } from './middleware-stage.enum';

/**
 * Structured information about a middleware cancellation, carried by
 * {@link CancelError.details}.
 */
export interface CancelDetails {
  /** The stage whose `before` hook cancelled the operation. */
  stage: MiddlewareStage;
  /** Human-readable reason; becomes the `CancelError` message when set. */
  reason?: string;
  /** `name` of the middleware that returned the interrupt decision. */
  middleware?: string;
  /** The static `ID` of the cancelled message or executor. */
  messageId?: string;
  /** Reserved for namespace attribution; not populated by the built-in pipeline. */
  namespace?: string;
}
