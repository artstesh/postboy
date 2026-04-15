import { PostboyMessageMetadata } from './postboy-message-metadata';

export abstract class PostboyMessage {
  public metadata: PostboyMessageMetadata = {};
  public get id(): string {
    return (this.constructor as any).ID;
  }

  setMetadata(metadata: Partial<PostboyMessageMetadata>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }
}
