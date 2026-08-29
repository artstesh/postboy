import { MiddlewareDecisionType } from './middleware-decision.enum';

/** The decision returned by a middleware's `before` hook. */
export interface MiddlewareDecision {
  /** Whether the operation may proceed; {@link MiddlewareDecisionType.Interrupt} cancels it. */
  type: MiddlewareDecisionType;
}
