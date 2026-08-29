/**
 * Execution context of a message — a snapshot of where in a message-causality chain the
 * current code runs, built by the internal context tracking when it is active.
 */
export interface PostboyMessageContext {
  /** Shared by every message of one logical operation; equals the root message's id. */
  correlationId: string;
  /** The static `ID` of the message currently being processed. */
  currentMessageId: string;
  /** The `ID` of the message whose handling triggered this one, when nested. */
  parentMessageId?: string;
  /** How many messages separate this one from the root of the chain. */
  depth: number;
  /** When the root message of the chain was fired. */
  startedAt: Date;
  /** Tags accumulated along the chain — the union of the messages' metadata tags. */
  tags?: Set<string>;
}
