import { Subject } from 'rxjs';
import { PostboyMessageStore } from '../../services/postboy-message.store';
import { PostboySubscription } from '../../models/postboy-subscription';
import { Forger } from '@artstesh/forger';

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

    it('should throw an error if the message does not exist', () => {
      const name = Forger.create<string>({ stringSpecial: false })!;
      const id = Forger.create<string>()!;
      //
      expect(() => store.getMessage(id, name)).toThrow(new RegExp('.?' + name + '.?', 'g'));
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

    it('should throw an error if the executor does not exist', () => {
      const id = Forger.create<string>({ stringSpecial: false })!;
      expect(() => store.getExecutor(id)).toThrow(new RegExp('.?' + id + '.?', 'g'));
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

  describe('callbackFired', () => {
    it('should complete fired callbacks on unregister', () => {
      const id = Forger.create<string>()!;
      const callbackMessage = { id } as any;
      let completed = false;
      callbackMessage.complete = () => (completed = true);
      store.callbackFired(callbackMessage);
      //
      store.unregister(id);
      //
      expect(completed).toBe(true);
    });

    it('should complete all fired callbacks for the same message id on unregister', () => {
      const id = Forger.create<string>()!;
      let completedCount = 0;
      const callbackMessage = { id, complete: () => completedCount++ } as any;
      store.callbackFired(callbackMessage);
      store.callbackFired(callbackMessage);
      //
      store.unregister(id);
      //
      expect(completedCount).toBe(2);
    });
  });

  describe('dispose', () => {
    it('should finish all registered messages and clear the store', () => {
      const id = Forger.create<string>()!;
      let finished = false;
      subscription.sub().subscribe({ complete: () => (finished = true) });
      store.registerMessage(id, subscription);
      //
      store.dispose();
      //
      expect(finished).toBe(true);
      expect(() => store.getMessage(id, 'TestMessage')).toThrow();
    });

    it('should complete fired callbacks on dispose', () => {
      const id = Forger.create<string>()!;
      let completed = false;
      const callbackMessage = { id, complete: () => (completed = true) } as any;
      store.callbackFired(callbackMessage);
      //
      store.dispose();
      //
      expect(completed).toBe(true);
    });

    it('should be idempotent', () => {
      expect(() => {
        store.dispose();
        store.dispose();
      }).not.toThrow();
    });
  });

  describe('duplicate registration', () => {
    it('should warn when a message id is registered twice', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const id = Forger.create<string>()!;
      //
      store.registerMessage(id, subscription);
      store.registerMessage(id, subscription);
      //
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when an executor id is registered twice', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const id = Forger.create<string>()!;
      //
      store.registerExecutor(id, jest.fn());
      store.registerExecutor(id, jest.fn());
      //
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
