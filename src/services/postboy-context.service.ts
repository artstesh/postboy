import { AsyncLocalStorage } from 'node:async_hooks';
import { PostboyMessageContext } from '../models/postboy-message.context';
import { PostboyMessage } from '../models/postboy.message';

/**
 * Message-causality tracking built on Node's `AsyncLocalStorage`: it propagates a
 * {@link PostboyMessageContext} across async boundaries, so a message fired while
 * handling another message becomes its child in the correlation chain.
 *
 * Not wired into `PostboyService` by default — instantiate and call it directly from
 * application code when correlation ids are needed. Node-only (relies on
 * `node:async_hooks`).
 */
export class PostboyContextService {
  private readonly storage = new AsyncLocalStorage<PostboyMessageContext>();

  /**
   * @param active - When false, {@link run} executes actions bare and
   * {@link createChild} always builds fresh root contexts.
   */
  constructor(public active: boolean = true) {}

  private get current(): PostboyMessageContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Executes the action with the given context active, so nested {@link createChild}
   * calls treat it as the parent. Runs the action bare when inactive.
   */
  public run<T>(context: PostboyMessageContext, action: () => T): T {
    return this.active ? this.storage.run(context, action) : action();
  }

  /** Builds the root context of a chain: correlation id equals the message id, depth 0. */
  private createRoot(message: PostboyMessage): PostboyMessageContext {
    return {
      correlationId: message.id,
      currentMessageId: message.id,
      depth: 0,
      startedAt: new Date(),
      tags: message.metadata?.tags ?? new Set(),
    };
  }

  /**
   * Builds the context for a message: a continuation of the active parent's chain —
   * same correlation id and start time, incremented depth, union of tags — or a fresh
   * root when no context is active. Stamps correlation, causation, and tags onto the
   * message metadata as a side effect.
   */
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
      tags: context.tags,
    });
  }

  /** Disables the underlying async storage; no context is tracked afterwards. */
  public dispose(): void {
    this.storage.disable();
  }
}
