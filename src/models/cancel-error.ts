import { CancelDetails } from './cancel-details';
import { MiddlewareStage } from './middleware-stage.enum';

/**
 * The error thrown when a middleware interrupts an operation by returning an interrupt
 * decision from its `before` hook — the operation does not run.
 *
 * Thrown by `PostboyService.fire`, `fireCallback`, and `exec`. Distinguish it from other
 * errors via `error.name === 'PostboyCancelError'` or `error instanceof CancelError`,
 * then inspect {@link details} to find the cancelling middleware and stage.
 */
export class CancelError extends Error {
  /** Structured information about the cancellation. */
  public readonly details: CancelDetails;

  /**
   * @param details - What was cancelled, where, and why; `details.reason` — or a generated
   * stage message — becomes the error message.
   */
  constructor(details: CancelDetails) {
    super(details.reason ?? `Postboy operation was cancelled at stage "${MiddlewareStage[details.stage]}"`);
    this.name = 'PostboyCancelError';
    this.details = details;
  }
}

/**
 * Type guard checking whether an unknown error is a {@link CancelError}.
 *
 * @param error - The caught value.
 * @return True when the error was produced by a middleware interruption.
 */
export function isCancelError(error: unknown): error is CancelError {
  return error instanceof CancelError;
}
