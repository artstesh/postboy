import { LockerStore } from './locker.store';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';
import { PostboyLocker } from './models/postboy.locker';

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
    const locker = Forger.create<PostboyLocker>()!;
    //
    store.addLocker(locker);
    //
    should().true(store.check(locker.locking[0]));
  });

  it('lock success', () => {
    const locker = Forger.create<PostboyLocker>()!;
    //
    store.addLocker(locker);
    store.check(locker.locker!);
    //
    should().false(store.check(locker.locking[0]));
  });

  it('unlock success', () => {
    const locker = Forger.create<PostboyLocker>()!;
    //
    store.addLocker(locker);
    store.check(locker.locker!);
    store.check(locker.unlocker!);
    //
    should().true(store.check(locker.locking[0]));
  });
});
