import {AsyncLocalStorage} from 'node:async_hooks';
import {PostboyMessageContext} from '../models/postboy-message.context';
import {PostboyMessage} from '../models/postboy.message';

export class PostboyContextService {
  private readonly storage = new AsyncLocalStorage<PostboyMessageContext>();

  constructor(public active: boolean = true) {
  }

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
      tags: message.metadata?.tags ?? new Set(),
    };
  }

  public createChild(message: PostboyMessage): PostboyMessageContext {
    if (!this.active) {
      const context = this.createRoot(message);
      this.updateMessage(message, context);
      return context;
    }
    const parent = this.current;
    const tags = new Set([...(this.current?.tags ?? []), ...(message.metadata?.tags ?? [])]);
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
    this.updateMessage(message, data);
    return data;
  }

  private updateMessage(message: PostboyMessage, context: PostboyMessageContext): void {
    message.setMetadata({
      correlationId: context.correlationId,
      causationId: context.parentMessageId,
      tags: context.tags
    });
  }

  public dispose(): void {
    this.storage.disable();
  }
}
