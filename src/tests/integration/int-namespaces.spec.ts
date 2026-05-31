import { TestPostboy } from '../shared/models/test-postboy';
import { TestMessage } from '../shared/models/test-message';
import { TestCallbackMessage } from '../shared/models/test-callback-message';
import { TestReg } from '../shared/models/test-registry';
import { skip, Subject, tap } from 'rxjs';
import { should } from '@artstesh/it-should';
import { Forger } from '@artstesh/forger';
import { PostboyAbstractRegistrator } from '../../postboy-abstract.registrator';
import { AddNamespace } from '../../messages/add-namespace.executor';
import { EliminateNamespace } from '../../messages/eliminate-namespace.executor';

describe('Integration.Namespaces', () => {
  let postboy: TestPostboy;

  beforeEach(() => {
    postboy = new TestPostboy();
  });


  it('should unsubscribe callback messages', (done) => {
    const namespace = Forger.create<string>()!;
    postboy.exec(new AddNamespace(namespace)).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage(Forger.create<string>()!);
    message.result.subscribe({ complete: () => done() });
    postboy.fireCallback(message);
    //
    postboy.exec(new EliminateNamespace(namespace));
  });

  it('should fulfil callback messages', (done) => {
    const namespace = Forger.create<string>()!;
    postboy.exec(new AddNamespace(namespace)).recordSubject(TestCallbackMessage);
    const message = new TestCallbackMessage(Forger.create<string>()!);
    message.result.subscribe(() => done());
    //
    message.finish(Forger.create<string>()!);
  });
});
