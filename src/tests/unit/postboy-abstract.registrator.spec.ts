// postboy-abstract.registrator.spec.ts
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';
import {PostboyAbstractRegistrator} from '../../postboy-abstract.registrator';
import {IPostboyDependingService} from '../../i-postboy-depending.service';
import {PostboyGenericMessage} from '../../models/postboy-generic-message';
import {PostboyExecutor} from '../../models/postboy-executor';
import {Forger} from '@artstesh/forger';
import {capture, instance, mock, reset, verify} from 'ts-mockito';
import {should} from '@artstesh/it-should';
import {ConnectMessage} from '../../messages/connect-message.executor';
import {ConnectExecutor} from '../../messages/connect-executor.executor';
import {ConnectHandler} from '../../messages/connect-handler.executor';
import {PostboyService} from "../../postboy.service";
import {DisconnectMessage} from "../../messages";
import fn = jest.fn;

class TestMessage extends PostboyGenericMessage {
  static ID = 'test-message';
}

class TestExec extends PostboyExecutor<string> {
  static ID = Forger.create<string>({stringSpecial: false})!;
}

class TestPostboyRegistrator extends PostboyAbstractRegistrator {
  protected _up(): void {
    // Implement abstract method for testing
  }
}

describe('PostboyAbstractRegistrator', () => {
  let postboy = mock(PostboyService);
  let registrator: TestPostboyRegistrator;

  beforeEach(() => {
    registrator = new TestPostboyRegistrator(instance(postboy));
  });

  afterEach(() => {
    reset(postboy);
  })

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
    it('should unregister all id entries and clear services', async () => {
      const service = mock<IPostboyDependingService>();
      registrator.record(TestMessage, new Subject());
      registrator.recordExecutor(TestExec, fn());
      registrator.registerServices([instance(service)]);
      registrator.up();
      //
      registrator.down();
      //
      verify(service.down?.()).once();
      const [msg2] = capture(postboy.exec<any>).last();
      const [msg1] = capture(postboy.exec<any>).beforeLast();
      should().array([(msg1 as DisconnectMessage).messageId, (msg2 as DisconnectMessage).messageId])
        .equalUnordered([TestMessage.ID, TestExec.ID]);
    });
  });

  describe('record', () => {
    it('should add id and call postboy.record', () => {
      const subject = new Subject<TestMessage>();
      //
      const result = registrator.record(TestMessage, subject);
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true((msg1 as ConnectMessage<any>).type === TestMessage);
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
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectMessage.ID);
      should().true((msg1 as ConnectMessage<any>).sub === subject);
      should().true((msg1 as ConnectMessage<any>).pipe === pipeFn);
      should().true(result === registrator);
    });
  });

  describe('recordExecutor', () => {
    it('should call postboy.recordExecutor with provided executor and logic', () => {
      const executorLogic = jest.fn();
      //
      const result = registrator.recordExecutor(TestExec, executorLogic);
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectExecutor.ID);
      should().true((msg1 as ConnectExecutor<any, any>).type === TestExec);
      should().true((msg1 as ConnectExecutor<any, any>).exec === executorLogic);
      should().true(result === registrator);
    });
  });

  describe('recordHandler', () => {
    it('should call postboy.recordHandler with provided executor and handler', () => {
      const handler = {handle: jest.fn()};
      //
      const result = registrator.recordHandler(TestExec, handler);
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectHandler.ID);
      should().true((msg1 as ConnectHandler<any, any>).handler === handler);
      should().true((msg1 as ConnectHandler<any, any>).executor === TestExec);
      should().true(result === registrator);
    });
  });

  describe('recordReplay', () => {
    it('should call record with ReplaySubject and given bufferSize', () => {
      const bufferSize = Forger.create<number>()!;
      //
      const result = registrator.recordReplay(TestMessage, bufferSize);
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectMessage.ID);
      should().true((msg1 as ConnectMessage<any>).sub instanceof ReplaySubject);
      should().true((msg1 as ConnectMessage<any>).type === TestMessage);
      should().true(result === registrator);
    });
  });

  describe('recordBehavior', () => {
    it('should call record with BehaviorSubject and initial value', () => {
      const result = registrator.recordBehavior(TestMessage, new TestMessage());
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectMessage.ID);
      should().true((msg1 as ConnectMessage<any>).sub instanceof BehaviorSubject);
      should().true((msg1 as ConnectMessage<any>).type === TestMessage);
      should().true(result === registrator);
    });
  });

  describe('recordSubject', () => {
    it('should call record with a new Subject instance', () => {
      const result = registrator.recordSubject(TestMessage);
      //
      const [msg1] = capture(postboy.exec<any>).last();
      should().true(msg1.id === ConnectMessage.ID);
      should().true((msg1 as ConnectMessage<any>).type === TestMessage);
      should().true(result === registrator);
    });
  });
});
