import { Subject } from 'rxjs';
import { PostboyMessageStore } from '../../services/postboy-message.store';
import { PostboySubscription } from '../../models/postboy-subscription';
import { NoRegisteredMessageError } from '../../models/no-registered-message-error';
import { NoRegisteredExecutorError } from '../../models/no-registered-executor-error';
import { Forger } from '@artstesh/forger';
import { should } from '@artstesh/it-should';

describe('PostboyMessageStore', () => {
  let store: PostboyMessageStore;
  let subject: Subject<number>;
  let subscription: PostboySubscription<number>;

  beforeEach(() => {
    store = new PostboyMessageStore();
    subject = new Subject<number>();
    subscription = new PostboySubscription(subject, (s) => s.asObservable());
  });

  describe('getMessage', () => {
    it('should retrieve a registered message', () => {
      let id = Forger.create<string>()!;
      store.registerMessage(id, subscription);
      //
      const result = store.getMessage(id, 'TestMessage');
      expect(result).toBe(subscription);
    });

    it('should throw a NoRegisteredMessageError if the message does not exist', () => {
      const name = Forger.create<string>({ stringSpecial: false })!;
      const id = Forger.create<string>()!;
      let error: unknown;
      //
      try {
        store.getMessage(id, name);
      } catch (e) {
        error = e;
      }
      //
      expect(error).toBeInstanceOf(NoRegisteredMessageError);
      expect(() => store.getMessage(id, name)).toThrow(new RegExp('.?' + name + '.?', 'g'));
      should()
        .string((error as NoRegisteredMessageError).id)
        .equals(id);
      should()
        .string((error as NoRegisteredMessageError).typeName)
        .equals(name);
    });
  });

  describe('getExecutor', () => {
    it('should retrieve a registered executor', () => {
      const executor = jest.fn();
      const id = Forger.create<string>()!;
      //
      store.registerExecutor(id, executor);
      //
      expect(store.getExecutor(id)).toBe(executor);
    });

    it('should throw a NoRegisteredExecutorError if the executor does not exist', () => {
      const id = Forger.create<string>({ stringSpecial: false })!;
      let error: unknown;
      //
      try {
        store.getExecutor(id);
      } catch (e) {
        error = e;
      }
      //
      expect(error).toBeInstanceOf(NoRegisteredExecutorError);
      expect(() => store.getExecutor(id)).toThrow(new RegExp('.?' + id + '.?', 'g'));
      should()
        .string((error as NoRegisteredExecutorError).id)
        .equals(id);
    });
  });

  describe('unregister', () => {
    it('should unregister a message and its subscription', () => {
      const name = Forger.create<string>()!;
      const id = Forger.create<string>()!;
      //
      store.registerMessage(id, subscription);
      store.unregister(id);
      //
      expect(() => store.getMessage(id, name)).toThrow();
    });

    it('should handle unregistering a non-existent message gracefully', () => {
      expect(() => store.unregister(Forger.create<string>()!)).not.toThrow();
    });
  });
});
