import { Forger } from '@artstesh/forger';
import { PostboyContextService } from '../../services/postboy-context.service';
import { TestMessage } from '../shared/models/test-message';

describe('PostboyContextService', () => {
  it('should create root context for first message', () => {
    const service = new PostboyContextService(true);
    const message = new TestMessage(Forger.create<string>()!);

    const context = service.createChild(message);

    expect(context.correlationId).toBe(message.id);
    expect(context.currentMessageId).toBe(message.id);
    expect(context.depth).toBe(0);
    expect(context.parentMessageId).toBeUndefined();
    expect(context.startedAt).toBeInstanceOf(Date);
    expect(context.tags).toBeInstanceOf(Set);

    expect(message.metadata?.correlationId).toBe(message.id);
    expect(message.metadata?.causationId).toBeUndefined();
  });

  it('should create nested context from parent', () => {
    const service = new PostboyContextService(true);

    const parentMessage = new TestMessage(Forger.create<string>()!);
    const childMessage = new TestMessage(Forger.create<string>()!);

    const parentContext = service.createChild(parentMessage);

    service.run(parentContext, () => {
      const childContext = service.createChild(childMessage);

      expect(childContext.correlationId).toBe(parentContext.correlationId);
      expect(childContext.currentMessageId).toBe(childMessage.id);
      expect(childContext.parentMessageId).toBe(parentMessage.id);
      expect(childContext.depth).toBe(1);
      expect(childContext.startedAt).toBe(parentContext.startedAt);
    });

    expect(childMessage.metadata?.correlationId).toBe(parentMessage.id);
    expect(childMessage.metadata?.causationId).toBe(parentMessage.id);
  });

  it('should merge tags from message metadata into context', () => {
    const service = new PostboyContextService(true);
    const message = new TestMessage(Forger.create<string>()!);

    message.setMetadata({
      tags: new Set(['alpha', 'beta']),
    });

    const context = service.createChild(message);

    expect(context.tags?.has('alpha')).toBe(true);
    expect(context.tags?.has('beta')).toBe(true);
    expect(context.tags?.size).toBe(2);

    expect(message.metadata?.tags?.has('alpha')).toBe(true);
    expect(message.metadata?.tags?.has('beta')).toBe(true);
  });

  it('should propagate parent tags to child context', () => {
    const service = new PostboyContextService(true);

    const parentMessage = new TestMessage(Forger.create<string>()!);
    parentMessage.setMetadata({
      tags: new Set(['parent-tag']),
    });

    const childMessage = new TestMessage(Forger.create<string>()!);
    childMessage.setMetadata({
      tags: new Set(['child-tag']),
    });

    const parentContext = service.createChild(parentMessage);

    service.run(parentContext, () => {
      const childContext = service.createChild(childMessage);

      expect(childContext.tags?.has('parent-tag')).toBe(true);
      expect(childContext.tags?.has('child-tag')).toBe(true);
      expect(childContext.tags?.size).toBe(2);
    });

    expect(childMessage.metadata?.tags?.has('parent-tag')).toBe(true);
    expect(childMessage.metadata?.tags?.has('child-tag')).toBe(true);
  });

  it('should keep current context inside run()', () => {
    const service = new PostboyContextService(true);

    const rootMessage = new TestMessage(Forger.create<string>()!);
    const nestedMessage = new TestMessage(Forger.create<string>()!);

    const rootContext = service.createChild(rootMessage);

    service.run(rootContext, () => {
      const nested = service.createChild(nestedMessage);
      expect(nested.depth).toBe(1);
      expect(nested.parentMessageId).toBe(rootMessage.id);
    });
  });

  it('should not keep current context outside run()', () => {
    const service = new PostboyContextService(true);

    const firstMessage = new TestMessage(Forger.create<string>()!);
    const secondMessage = new TestMessage(Forger.create<string>()!);

    const firstContext = service.createChild(firstMessage);
    const secondContext = service.createChild(secondMessage);

    service.run(firstContext, () => {
      const nested = service.createChild(new TestMessage(Forger.create<string>()!));
      expect(nested.depth).toBe(1);
    });

    const outside = service.createChild(new TestMessage(Forger.create<string>()!));
    expect(outside.depth).toBe(0);
    expect(outside.parentMessageId).toBeUndefined();

    service.run(secondContext, () => {
      const nested = service.createChild(new TestMessage(Forger.create<string>()!));
      expect(nested.depth).toBe(1);
    });
  });

  it('should return root-like context when inactive', () => {
    const service = new PostboyContextService(false);
    const message = new TestMessage(Forger.create<string>()!);

    const context = service.createChild(message);

    expect(context.correlationId).toBe(message.id);
    expect(context.currentMessageId).toBe(message.id);
    expect(context.depth).toBe(0);
    expect(context.parentMessageId).toBeUndefined();

    expect(message.metadata?.correlationId).toBe(message.id);
    expect(message.metadata?.causationId).toBeUndefined();
  });

  it('should run action directly when inactive', () => {
    const service = new PostboyContextService(false);

    let called = false;

    service.run(
      {
        correlationId: 'x',
        currentMessageId: 'y',
        depth: 0,
        startedAt: new Date(),
        tags: new Set(),
      },
      () => {
        called = true;
      },
    );

    expect(called).toBe(true);
  });

  it('should dispose safely and be idempotent', () => {
    const service = new PostboyContextService(true);

    expect(() => service.dispose()).not.toThrow();
    expect(() => service.dispose()).not.toThrow();
  });
});
