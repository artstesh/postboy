// postboy-abstract.registrator.spec.ts
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';
import {PostboyAbstractRegistrator} from '../../postboy-abstract.registrator';
import {IPostboyDependingService} from '../../i-postboy-depending.service';
import {PostboyGenericMessage} from '../../models/postboy-generic-message';
import {PostboyExecutor} from '../../models/postboy-executor';
import {Forger} from '@artstesh/forger';
import {instance, mock, verify} from 'ts-mockito';
import {should} from '@artstesh/it-should';
import {DisconnectMessage} from '../../messages/disconnect-message.executor';
import {ConnectMessage} from '../../messages/connect-message.executor';
import {ConnectExecutor} from '../../messages/connect-executor.executor';
import {ConnectHandler} from '../../messages/connect-handler.executor';
import {PostboyService} from "../../postboy.service";

class TestMessage extends PostboyGenericMessage {
  static ID = 'test-message';
}

class TestExec extends PostboyExecutor<string> {
  static ID = Forger.create<string>({ stringSpecial: false })!;
}

class TestPostboyRegistrator extends PostboyAbstractRegistrator {
  protected _up(): void {
    // Implement abstract method for testing
  }
}

describe('PostboyAbstractRegistrator', () => {
  let postboy: PostboyService;
  let registrator: TestPostboyRegistrator;

  beforeEach(() => {
    postboy = new PostboyService();
    registrator = new TestPostboyRegistrator(postboy as any);
  });

  describe('up', () => {
    it('should call _up and up on registered services', () => {
      const service = mock<IPostboyDependingService>();
      registrator.registerServices([instance(service)]);
      //
      registrator.up();
      //
      verify(service.up()).once();
    });
  });

  describe('down', () => {
    it('should unregister all id entries and clear services', () => {
      const service = mock<IPostboyDependingService>();
      registrator.record(TestMessage, new Subject());
      registrator.recordExecutor(TestExec, () => '');
      registrator.registerServices([instance(service)]);
      registrator.up();
      //
      registrator.down();
      //
      verify(service.down?.()).once();
      should().array(postboy.history(DisconnectMessage).all).length(2);
    });
  });

  describe('record', async () => {
    it('should add id and call postboy.record', () => {
      const subject = new Subject<TestMessage>();
      let regMessage: ConnectMessage<any> | null = null;
      //
      postboy.sub(ConnectMessage).subscribe((msg) => (regMessage = msg));
      const result = registrator.record(TestMessage, subject);
      waitFor(() => regMessage !== null);
      //

      const history = postboy.history(ConnectMessage);
      should().array(history.all).length(1);
      should().true(history.last.type === TestMessage);
      should().true(result === registrator);
    });
  });

  describe('recordWithPipe', () => {
    it('should add id and call postboy.recordWithPipe', () => {
      const subject = new Subject<TestMessage>();
      const pipeFn = jest.fn();
      //
      const result = registrator.recordWithPipe(TestMessage, subject, pipeFn);
      //
      const history = postboy.history(ConnectMessage);
      should().array(history.all).length(1);
      should().true(history.last.type === TestMessage);
      should().true(history.last.sub === subject);
      should().true(history.last.pipe === pipeFn);
      should().true(result === registrator);
    });
  });

  describe('recordExecutor', () => {
    it('should call postboy.recordExecutor with provided executor and logic', () => {
      const executorLogic = jest.fn();
      //
      const result = registrator.recordExecutor(TestExec, executorLogic);
      //
      const history = postboy.history(ConnectExecutor);
      should().array(history.all).length(1);
      should().true(history.last.type === TestExec);
      should().true(history.last.exec === executorLogic);
      should().true(result === registrator);
    });
  });

  describe('recordHandler', () => {
    it('should call postboy.recordHandler with provided executor and handler', () => {
      const handler = { handle: jest.fn() };
      //
      const result = registrator.recordHandler(TestExec, handler);
      //
      const history = postboy.history(ConnectHandler);
      should().array(history.all).length(1);
      should().true(history.last.handler === handler);
      should().true(history.last.executor === TestExec);
      should().true(result === registrator);
    });
  });

  describe('recordReplay', () => {
    it('should call record with ReplaySubject and given bufferSize', () => {
      const bufferSize = Forger.create<number>()!;
      //
      const result = registrator.recordReplay(TestMessage, bufferSize);
      //
      const history = postboy.history(ConnectMessage);
      should().array(history.all).length(1);
      should().true(history.last.sub instanceof ReplaySubject);
      should().true(history.last.type === TestMessage);
      should().true(result === registrator);
    });
  });

  describe('recordBehavior', () => {
    it('should call record with BehaviorSubject and initial value', () => {
      const result = registrator.recordBehavior(TestMessage, new TestMessage());
      //
      const history = postboy.history(ConnectMessage);
      should().array(history.all).length(1);
      should().true(history.last.sub instanceof BehaviorSubject);
      should().true(history.last.type === TestMessage);
      should().true(result === registrator);
    });
  });

  describe('recordSubject', () => {
    it('should call record with a new Subject instance', () => {
      const result = registrator.recordSubject(TestMessage);
      //

      const history = postboy.history(ConnectMessage);
      should().array(history.all).length(1);
      should().true(history.last.type === TestMessage);
      should().true(result === registrator);
    });
  });
});
