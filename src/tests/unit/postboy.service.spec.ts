import {Subject} from 'rxjs';
import {PostboyService} from '../../postboy.service';
import {PostboyExecutor} from '../../models/postboy-executor';
import {PostboyGenericMessage} from '../../models/postboy-generic-message';
import {PostboyCallbackMessage} from '../../models/postboy-callback.message';
import {Forger} from '@artstesh/forger';
import {anything, instance, mock, reset, verify, when} from 'ts-mockito';
import {PostboyMiddlewareService} from '../../services/postboy-middleware.service';
import {PostboyMessageStore} from '../../services/postboy-message.store';
import {PostboyDependencyResolver} from '../../services/postboy-dependency.resolver';
import {PostboySubscription} from '../../models/postboy-subscription';
import {should} from '@artstesh/it-should';
import {PostboyContextService} from '../../services/postboy-context.service';

describe('PostboyService', () => {
  let service: PostboyService;
  const middleware = mock(PostboyMiddlewareService);
  const store = mock(PostboyMessageStore);
  const context = mock(PostboyContextService);

  beforeEach(() => {
    const resolver = mock(PostboyDependencyResolver);
    when(resolver.getMiddlewareService()).thenReturn(instance(middleware));
    when(resolver.getMessageStore()).thenReturn(instance(store));
    when(resolver.getPostboyContextService).thenReturn(() => instance(context));
    when(context.run).thenReturn((c, f) => f());
    service = new PostboyService({}, instance(resolver));
  });

  afterEach(() => {
    reset(middleware);
    reset(store);
    reset(context);
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
    });

    it('should apply middleware.beforePublish', () => {
      const message = new TestMessage();
      //
      service.fire(message);
      //
      verify(middleware.beforePublish(message, anything())).once();
    });

    it('should apply middleware.afterPublish', () => {
      const message = new TestMessage();
      //
      service.fire(message);
      //
      verify(middleware.afterPublish(message, anything())).once();
    });

    it('should fire the message', () => {
      const message = new TestMessage();
      //
      service.fire(message);
      //
      verify(subscription.fire(message)).once();
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

    it('should apply middleware.beforeCallback', () => {
      const text = Forger.create<string>()!;
      const message = new TestMessage();
      const action = jest.fn();
      //
      service.fireCallback(message, action);
      //
      verify(middleware.beforeCallback(message, anything())).once();
    });

    it('should apply middleware.afterCallback with subscribe', (done) => {
      const text = Forger.create<string>()!;
      const message = new TestMessage();
      service.record(TestMessage, new Subject());
      //
      const observable = service.fireCallback(message);
      observable.subscribe((value) => {
        verify(middleware.afterCallback(message, anything())).once();
        done();
      });
      message.finish(text);
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

    it('should apply middleware.beforeExecute', () => {
      const executor = new TestExec();
      when(store.getExecutor(TestExec.ID)).thenReturn(jest.fn());
      //
      service.exec(executor);
      //
      verify(middleware.beforeExecute(executor, anything())).once();
    });

    it('should apply middleware.afterExecute', () => {
      const executor = new TestExec();
      when(store.getExecutor(TestExec.ID)).thenReturn(jest.fn());
      //
      service.exec(executor);
      //
      verify(middleware.afterExecute(executor, anything(), anything())).once();
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
    });

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
