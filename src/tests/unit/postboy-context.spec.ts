import { PostboyContextService } from '../../services/postboy-context.service';
import { PostboyMessage } from '../../models/postboy.message';
import { PostboyMessageContext } from '../../models/postboy-message.context';
import { Forger } from '@artstesh/forger';

class TestMessage extends PostboyMessage {
  static ID = Forger.create<string>()!;
}

describe('PostboyContextService', () => {
  let service: PostboyContextService;

  beforeEach(() => {
    service = new PostboyContextService();
  });

  describe('run', () => {
    it('should run the action within the provided context when active', () => {
      const context: PostboyMessageContext = {
        correlationId: Forger.create<string>()!,
        currentMessageId: Forger.create<string>()!,
        depth: 0,
        startedAt: new Date(),
        tags: new Set(),
      };

      const spy = jest.fn(() => 'result');
      const result = service.run(context, spy);

      expect(result).toBe('result');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should run the action without context when inactive', () => {
      service = new PostboyContextService(false);

      const context: PostboyMessageContext = {
        correlationId: Forger.create<string>()!,
        currentMessageId: Forger.create<string>()!,
        depth: 0,
        startedAt: new Date(),
        tags: new Set(),
      };

      const spy = jest.fn(() => 'result');
      const result = service.run(context, spy);

      expect(result).toBe('result');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createChild', () => {
    it('should create a root context when no parent exists', () => {
      const message = new TestMessage();
      const context = service.createChild(message);

      expect(context.correlationId).toBe(message.id);
      expect(context.currentMessageId).toBe(message.id);
      expect(context.depth).toBe(0);
      expect(context.tags).toEqual(new Set());
    });

    it('should inherit context from the parent when a parent exists', () => {
      const message = new TestMessage();
      const parentId = Forger.create<string>()!;
      const parentContext: PostboyMessageContext = {
        correlationId: parentId,
        currentMessageId: parentId,
        depth: 0,
        startedAt: new Date(),
        tags: new Set(['tag1']),
      };

      service.run(parentContext, () => {
        message.metadata.tags = new Set(['tag2']);
        const childContext = service.createChild(message);

        expect(childContext.correlationId).toBe(parentId);
        expect(childContext.currentMessageId).toBe(message.id);
        expect(childContext.parentMessageId).toBe(parentId);
        expect(childContext.depth).toBe(1);
        expect(childContext.tags).toEqual(new Set(['tag1', 'tag2']));
      });
    });

    it('should create a root context when inactive', () => {
      service = new PostboyContextService(false);
      const message = new TestMessage();
      const context = service.createChild(message);

      expect(context.correlationId).toBe(message.id);
      expect(context.currentMessageId).toBe(message.id);
      expect(context.depth).toBe(0);
      expect(context.parentMessageId).toBeUndefined();
    });
  });
});
