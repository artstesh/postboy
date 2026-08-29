/**
 * Free-form metadata attached to a message via `PostboyMessage.setMetadata`.
 *
 * The predefined fields describe message correlation and causality; the index signature
 * accepts any custom key.
 */
export interface PostboyMessageMetadata {
  /** Ties together all messages belonging to one logical operation or request. */
  correlationId?: string;
  /** The `id` of the message that directly caused this one, when causality is tracked. */
  causationId?: string;
  /** Free-form labels used for categorization, filtering, or logging. */
  tags?: Set<string>;
  /** Any custom key-value data. */
  [key: string]: any;
}
