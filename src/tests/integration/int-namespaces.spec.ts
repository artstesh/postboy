import { TestPostboy } from './models/test-postboy';
import { TestMessage } from './models/test-message';
import { TestCallbackMessage } from './models/test-callback-message';
import { TestReg } from './models/test-registry';
import { skip, Subject, tap } from 'rxjs';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';
import {PostboyAbstractRegistrator} from "../../postboy-abstract.registrator";

describe('Integration.Namespaces', () => {
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

    describe(`subscribing`, () => {
      let namespace: string;

      beforeEach(() => {
        namespace = Forger.create<string>()!;
        postboy.addNamespace(namespace).recordSubject(message.type);
      });

      it(`should fire messages`, (done) => {
        postboy.sub(message.type).subscribe(() => done());
        //
        postboy.fire(message);
      });

      it(`should complete subs on down`, () => {
        const sub = postboy.sub(message.type).subscribe(() => {});
        //
        postboy.eliminateNamespace(namespace);
        //
        should().true(sub.closed);
      });
    });
  });

  it('should unsubscribe callback messages', (done) => {
    const namespace = Forger.create<string>()!;
    postboy.addNamespace(namespace).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage();
    message.result.subscribe({ complete: () => done() });
    postboy.fireCallback(message);
    //
    postboy.eliminateNamespace(namespace);
  });

  it('should fulfil callback messages', (done) => {
    const namespace = Forger.create<string>()!;
    postboy.addNamespace(namespace).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage();
    message.result.subscribe(() => done());
    //
    message.finish(Forger.create<string>()!);
  });
});
