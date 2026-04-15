/**
 * Represents metadata associated with a Postboy message.
 *
 * This interface can be used to store optional metadata that provides
 * additional context or tracking information for a message. It supports
 * flexible extension by allowing additional properties through an index signature.
 *
 * Properties:
 * - `correlationId` (optional): A unique identifier used to correlate
 *   related messages or operations across systems.
 * - `causationId` (optional): The identifier of the preceding message
 *   or event that caused the current message to be produced.
 * - `source` (optional): The origin or source of the message, such as
 *   a particular service or system.
 * - `tags` (optional): An array of tags or labels that can be attached
 *   to the message for categorization, filtering, or logging purposes.
 * - `[key: string]` (optional): Additional custom properties can be
 *   added to capture specific metadata not covered by the predefined fields.
 */
export interface PostboyMessageMetadata {
  correlationId?: string;
  causationId?: string;
  tags?: Set<string>;
  [key: string]: any;
}
