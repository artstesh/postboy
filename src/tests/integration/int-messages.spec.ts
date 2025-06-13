import { TestPostboy } from './models/test-postboy';
import { TestMessage } from './models/test-message';
import { TestCallbackMessage } from './models/test-callback-message';
import { TestReg } from './models/test-registry';
import { skip, Subject, tap } from 'rxjs';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';

describe('Integration.Messages', () => {
  let postboy: TestPostboy;

  beforeEach(() => {
    postboy = new TestPostboy();
  });

  [new TestMessage(), new TestCallbackMessage()].forEach((message) => {
    it(`should throw if fire not registered ${message.id}`, () => {
      expect(() => postboy.fire(message)).toThrow();
    });

    it(`should throw if sub not registered ${message.id}`, () => {
      expect(() => postboy.sub(message.type)).toThrow();
    });

    [
      { name: 'Subject', func: (r: TestReg) => r.recordSubject(message.type) },
      { name: 'Replay', func: (r: TestReg) => r.recordReplay(message.type) },
      { name: 'WithPipe', func: (r: TestReg) => r.recordWithPipe(message.type, new Subject(), (s) => s.pipe(tap())) },
    ].forEach((s) => {
      describe(`subscribing ${s.name} ${message.id}`, () => {
        let registry: TestReg;

        beforeEach(() => {
          registry = new TestReg(postboy);
          registry.ups.push(s.func);
          registry.up();
        });

        it(`should fire messages`, (done) => {
          postboy.sub(message.type).subscribe(() => done());
          //
          postboy.fire(message);
        });

        it(`should complete subs on down`, () => {
          const sub = postboy.sub(message.type).subscribe(() => {});
          //
          registry.down();
          //
          should().true(sub.closed);
        });
      });
    });

    describe(`subscribing Behavior`, () => {
      let registry: TestReg;

      beforeEach(() => {
        registry = new TestReg(postboy);
        registry.ups.push((r) => r.recordBehavior(message.type, message));
        registry.up();
      });

      it(`should fire messages`, (done) => {
        postboy
          .sub(message.type)
          .pipe(skip(1))
          .subscribe(() => done());
        //
        postboy.fire(message);
      });

      it(`should complete subs on down`, () => {
        const sub = postboy.sub(message.type).subscribe();
        //
        registry.down();
        //
        should().true(sub.closed);
      });
    });
  });

  it('should unsubscribe callback messages', (done) => {
    const registry = new TestReg(postboy);
    registry.recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage();
    message.result.subscribe({ complete: () => done() });
    postboy.fireCallback(message);
    //
    registry.down();
  });

  it('should fulfil callback messages', (done) => {
    new TestReg(postboy).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage();
    message.result.subscribe(() => done());
    //
    message.finish(Forger.create<string>()!);
  });
});
