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
});
