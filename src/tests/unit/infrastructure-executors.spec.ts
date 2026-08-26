import { LockMessage } from '../../messages/lock-message.executor';
import { UnlockMessage } from '../../messages/unlock-message.executor';
import { AddMiddleware } from '../../messages/add-middleware.executor';
import { RemoveMiddleware } from '../../messages/remove-middleware.executor';
import { AddNamespace } from '../../messages/add-namespace.executor';
import { EliminateNamespace } from '../../messages/eliminate-namespace.executor';
import { PostboyMiddleware } from '../../services/postboy-middleware';
import { TestMessage } from '../shared/models/test-message';
import { Forger } from '@artstesh/forger';

class StubMiddleware extends PostboyMiddleware {}

describe('Infrastructure executors', () => {
  it('should carry the message type in `LockMessage` and `UnlockMessage`', () => {
    //
    const lock = new LockMessage(TestMessage);
    const unlock = new UnlockMessage(TestMessage);
    //
    expect(lock.type).toBe(TestMessage);
    expect(unlock.type).toBe(TestMessage);
    expect(LockMessage.ID).toBeTruthy();
    expect(UnlockMessage.ID).toBeTruthy();
  });

  it('should carry the middleware instance in `AddMiddleware` and `RemoveMiddleware`', () => {
    const middleware = new StubMiddleware();
    //
    const add = new AddMiddleware(middleware);
    const remove = new RemoveMiddleware(middleware);
    //
    expect(add.middleware).toBe(middleware);
    expect(remove.middleware).toBe(middleware);
  });

  it('should carry the namespace in `AddNamespace` and `EliminateNamespace`', () => {
    const namespace = Forger.create<string>()!;
    //
    const add = new AddNamespace(namespace);
    const eliminate = new EliminateNamespace(namespace);
    //
    expect(add.space).toBe(namespace);
    expect(eliminate.space).toBe(namespace);
  });

  it('should have unique static ids across all infrastructure executors', () => {
    //
    const ids = [
      LockMessage.ID,
      UnlockMessage.ID,
      AddMiddleware.ID,
      RemoveMiddleware.ID,
      AddNamespace.ID,
      EliminateNamespace.ID,
    ];
    //
    expect(new Set(ids).size).toBe(ids.length);
  });
});
