import {Subject} from 'rxjs';
import {PostboyService} from '../../postboy.service';
import {PostboyExecutor} from '../../models/postboy-executor';
import {PostboyGenericMessage} from '../../models/postboy-generic-message';
import {PostboyCallbackMessage} from '../../models/postboy-callback.message';
import {Forger} from '@artstesh/forger';
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {PostboyMiddlewareService} from "../../services/postboy-middleware.service";
import {PostboyMessageStore} from "../../services/postboy-message.store";
import {PostboyDependencyResolver} from "../../services/postboy-dependency.resolver";
import {PostboyMiddleware} from "../../models/postboy-middleware";
import {PostboySubscription} from "../../models/postboy-subscription";
import {should} from "@artstesh/it-should";

describe('PostboyService', () => {
  let service: PostboyService;
  const middleware = mock(PostboyMiddlewareService);
  const store = mock(PostboyMessageStore);

  beforeEach(() => {
    const resolver = mock(PostboyDependencyResolver);
    when(resolver.getMiddlewareService()).thenReturn(instance(middleware));
    when(resolver.getMessageStore()).thenReturn(instance(store));
    service = new PostboyService(instance(resolver));
  });

  afterEach(() => {
    reset(middleware);
    reset(store);
  });

  it('should addMiddleware', () => {
    let mwr = Forger.create<PostboyMiddleware>()!;
    //
    service.addMiddleware(mwr);
    //
    verify(middleware.addMiddleware(mwr)).once();
  });

  it('should removeMiddleware', () => {
    let mwr = Forger.create<PostboyMiddleware>()!;
    //
    service.removeMiddleware(mwr);
    //
    verify(middleware.removeMiddleware(mwr)).once();
  });

  it('should unregister', () => {
    let id = Forger.create<string>()!;
    //
    service.unregister(id);
    //
    verify(store.unregister(id)).once();
  });

  describe('fire', () => {
    class TestMessage extends PostboyGenericMessage {
      static ID = Forger.create<string>()!;
    }

    const subscription = mock(PostboySubscription);

    beforeEach(() => {
      when(store.getMessage(TestMessage.ID, anything())).thenReturn(instance(subscription));
    });

    afterEach(() => {
      reset(subscription);
    })

    it('should apply middleware', () => {
      const message = new TestMessage();
      //
      service.fire(message);
      //
      verify(middleware.manage(message)).once();
    });

    it('should fire the message', () => {
      const message = new TestMessage();
      //
      service.fire(message);
      //
      verify(subscription.fire(message)).once();
    });

    it('should not fire a locked message', () => {
      const message = new TestMessage();
      service.lock(TestMessage);
      //
      service.fire(message);
      //
      verify(subscription.fire(message)).never();
    });
  });

  describe('fireCallback', () => {
    class TestMessage extends PostboyCallbackMessage<string> {
      static ID = Forger.create<string>()!;
    }

    const subscription = mock(PostboySubscription);

    beforeEach(() => {
      when(store.getMessage(TestMessage.ID, anything())).thenReturn(instance(subscription));
    });

    afterEach(() => {
      reset(subscription);
    });

    it('should apply middleware', () => {
      const message = new TestMessage();
      //
      service.fireCallback(message);
      //
      verify(middleware.manage(message)).once();
    });

    it('should fire a callback event and handle the action', () => {
      const text = Forger.create<string>()!;
      const message = new TestMessage();
      const action = jest.fn();
      //
      service.fireCallback(message, action);
      message.finish(text);
      //
      expect(action).toHaveBeenCalledWith(text);
    });

    it('should not fire a locked message', () => {
      const message = new TestMessage();
      service.lock(TestMessage);
      //
      service.fireCallback(message);
      //
      verify(subscription.fire(message)).never();
    });

    it('should return an observable that emits the expected result', (done) => {
      const text = 'expected-result';
      const message = new TestMessage();
      service.record(TestMessage, new Subject());
      //
      const observable = service.fireCallback(message);
      observable.subscribe((value) => {
        expect(value).toBe(text);
        done();
      });
      message.finish(text);
    });
  });

  describe('exec', () => {
    class TestExec extends PostboyExecutor<string> {
      static ID = Forger.create<string>()!;
    }

    it('should apply middleware', () => {
      const executor = new TestExec();
      when(store.getExecutor(TestExec.ID)).thenReturn(jest.fn());
      //
      service.exec(executor);
      //
      verify(middleware.manage(executor)).once();
    });

    it('should execute function', () => {
      const executor = new TestExec();
      const mockExecutor = jest.fn();
      when(store.getExecutor(TestExec.ID)).thenReturn(mockExecutor);
      //
      service.exec(executor);
      //
      expect(mockExecutor).toHaveBeenCalledWith(executor);
      expect(mockExecutor).toHaveBeenCalledTimes(1);
    });
  });

  describe('sub', () => {
    class TestMessage extends PostboyGenericMessage {
      static ID = Forger.create<string>()!;
    }

    const subscription = mock(PostboySubscription);

    beforeEach(() => {
      when(store.getMessage(TestMessage.ID, anything())).thenReturn(instance(subscription));
    });

    afterEach(() => {
      reset(subscription);
    })

    it('should return sub', () => {
      const expected = Forger.create<number>() as any;
      when(subscription.sub).thenReturn(() => expected);
      //
      should().true(service.sub(TestMessage) === expected);
    });
  });

  describe('record', () => {
    it('should register a message type with a subject', () => {
      class TestMessage extends PostboyCallbackMessage<string> {
        static ID = Forger.create<string>()!;
      }
      const subject = new Subject<TestMessage>();
      //
      service.record(TestMessage, subject);
      //
      verify(store.registerMessage(TestMessage.ID, anything())).once();
    });
  });

  describe('recordExecutor', () => {
    it('should register an executor without errors', () => {
      class TestExec extends PostboyExecutor<string> {
        static ID = Forger.create<string>()!;
      }
      let execFunc = jest.fn();
      //
      service.recordExecutor(TestExec, execFunc);
      //
      verify(store.registerExecutor(TestExec.ID, execFunc)).once();
    });
  });
});
