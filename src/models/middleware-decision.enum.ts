/**
 * The verdict a middleware returns from its `before` hook: let the operation proceed,
 * or cancel it.
 */
export enum MiddlewareDecisionType {
  /** Run the operation; the pipeline moves on to the next middleware. */
  Continue = 1,
  /** Cancel the operation: the bus throws a {@link CancelError} and the `after` hooks are skipped. */
  Interrupt,
}
