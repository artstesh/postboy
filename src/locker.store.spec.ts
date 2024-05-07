import { LockerStore } from './locker.store';
import { PostboyLocker } from './models/postboy.locker';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';

describe('LockerStore', () => {
  let store: LockerStore;

  beforeEach(() => {
    store = new LockerStore();
  });

  it('creation success', () => {
    should().true(store);
  });

  it('creation success', () => {
    should().true(store);
  });

  it('true if no lockers', () => {
    const id = Forger.create<string>()!;
    //
    should().true(store.check(id));
  });

  it('do not lock without check', () => {
    const locker: PostboyLocker = { locking: Forger.create<string[]>()! };
    //
    store.addLocker(locker);
    //
    should().true(store.check(locker.locking[0]));
  });

  it('lock success', () => {
    const locker: PostboyLocker = { locking: Forger.create<string[]>()!, locker: Forger.create<string>() };
    //
    store.addLocker(locker);
    store.check(locker.locker!);
    //
    should().false(store.check(locker.locking[0]));
  });

  it('unlock success', () => {
    const locker: PostboyLocker = {
      locking: Forger.create<string[]>()!,
      locker: Forger.create<string>(),
      unlocker: Forger.create<string>(),
    };
    //
    store.addLocker(locker);
    store.check(locker.locker!);
    store.check(locker.unlocker!);
    //
    should().true(store.check(locker.locking[0]));
  });
});
