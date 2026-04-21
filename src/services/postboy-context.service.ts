import { AsyncLocalStorage } from 'node:async_hooks';
import { PostboyMessageContext } from '../models/postboy-message.context';
import { PostboyMessage } from '../models/postboy.message';

export class PostboyContextService {
  private readonly storage = new AsyncLocalStorage<PostboyMessageContext>();

  constructor(public active: boolean = true) {}

  private get current(): PostboyMessageContext | undefined {
    return this.storage.getStore();
  }

  public run<T>(context: PostboyMessageContext, action: () => T): T {
    return this.active ? this.storage.run(context, action) : action();
  }

  private createRoot(message: PostboyMessage): PostboyMessageContext {
    return {
      correlationId: message.id,
      currentMessageId: message.id,
      depth: 0,
      startedAt: new Date(),
      tags: new Set(),
    };
  }

  public createChild(message: PostboyMessage): PostboyMessageContext {
    if (!this.active) return this.createRoot(message);
    const parent = this.current;
    const tags = this.current?.tags ?? new Set();
    message.metadata?.tags?.forEach((tag) => tags.add(tag));
    const data = !parent
      ? this.createRoot(message)
      : {
          correlationId: parent.correlationId,
          currentMessageId: message.id,
          parentMessageId: parent.currentMessageId,
          depth: parent.depth + 1,
          startedAt: parent.startedAt,
          tags,
        };
    message.setMetadata({ correlationId: data.correlationId, causationId: data.parentMessageId, tags: data.tags });
    return data;
  }

  public dispose(): void {
    this.storage.disable();
  }
}
