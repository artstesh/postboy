/**
 * A summary of a pipeline run: whether the operation was cancelled, and by whom.
 *
 * Kept for middleware implementations that collect their own run reports; the built-in
 * pipeline surfaces cancellations as a thrown {@link CancelError} instead.
 */
export type PipelineResult = {
  /** Whether an `Interrupt` decision stopped the operation. */
  cancelled: boolean;
  /** `name` of the middleware that cancelled the operation. */
  cancelledBy?: string;
  /** Why the operation was cancelled. */
  reason?: string;
};
