import { TestPostboy } from '../shared/models/test-postboy';
import { TestMessage } from '../shared/models/test-message';
import { TestCallbackMessage } from '../shared/models/test-callback-message';
import { TestReg } from '../shared/models/test-registry';
import { combineLatest, share, shareReplay, skip, Subject, tap } from 'rxjs';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';

describe('Integration.Messages', () => {
  let postboy: TestPostboy;

  beforeEach(() => {
    postboy = new TestPostboy();
  });


  it('should unsubscribe callback messages', (done) => {
    const registry = new TestReg(postboy);
    registry.recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage(Forger.create<string>()!);
    message.result.subscribe({ complete: () => done() });
    postboy.fireCallback(message);
    //
    registry.down();
  });

  it('should fulfil callback messages', (done) => {
    new TestReg(postboy).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage(Forger.create<string>()!);
    message.result.subscribe(() => done());
    //
    message.finish(Forger.create<string>()!);
  });

  it('should be able to be cooled with pipe', () => {
    let count = 0;
    new TestReg(postboy).recordWithPipe(TestMessage, new Subject(), (s) =>
      s.pipe(
        tap(() => count++),
        share(),
      ),
    );
    //
    combineLatest([postboy.sub(TestMessage), postboy.sub(TestMessage)]).subscribe();
    postboy.fire(new TestMessage(Forger.create<string>()!));
    //
    should().number(count).equals(1);
  });
});
