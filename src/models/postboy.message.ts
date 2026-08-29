import { PostboyMessageMetadata } from './postboy-message-metadata';

/**
 * Root of the message hierarchy — anything that travels through the bus.
 *
 * A message is a plain data carrier: dispatch behavior comes from the subclasses.
 * {@link PostboyGenericMessage} is the base for pub/sub messages, and
 * {@link PostboyExecutor} carries a synchronous command. The bus routes every one of
 * them by the static `ID` of the concrete class, exposed per instance by {@link id}.
 */
export abstract class PostboyMessage {
  /** Free-form data attached to the message; populate it via {@link setMetadata}. */
  public metadata: PostboyMessageMetadata = {};

  /** The static `ID` of the concrete message class — the key the bus routes by. */
  public get id(): string {
    return (this.constructor as any).ID;
  }

  /**
   * Shallow-merges the given fields into {@link metadata}.
   *
   * @param metadata - Fields to add or override.
   * @return This message, for chaining.
   */
  setMetadata(metadata: Partial<PostboyMessageMetadata>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }
}
