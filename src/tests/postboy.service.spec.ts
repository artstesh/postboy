import {Observable, Subject} from 'rxjs';
import {PostboyService} from "../postboy.service";
import {PostboyExecutor} from "../models/postboy-executor";
import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {PostboyCallbackMessage} from "../models/postboy-callback.message";
import {Forger} from "@artstesh/forger";
import {PostboyLocker} from "../models/postboy.locker";

describe('PostboyService', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
  });

  describe('addLocker', () => {
    it('should add a locker without errors', () => {
      const locker = Forger.create<PostboyLocker>()!;
      //
      expect(() => service.addLocker(locker)).not.toThrow();
    });
  });

  describe('recordExecutor', () => {
    it('should register an executor without errors', () => {
      class TestExec extends PostboyExecutor<string> {
        static ID = Forger.create<string>()!;
      }

      const mockExecutor = jest.fn();
      //
      expect(() => service.recordExecutor(TestExec, mockExecutor)).not.toThrow();
    });
  });

  describe('exec', () => {
    it('should execute the registered executor and return result', () => {
      class TestExec extends PostboyExecutor<string> {
        static ID = Forger.create<string>()!;
      }

      const mockExecutor = jest.fn().mockReturnValue('success');
      const executor = new TestExec();
      service.recordExecutor(TestExec, mockExecutor);
      //
      const result = service.exec<string>(executor);
      //
      expect(result).toBe('success');
      expect(mockExecutor).toHaveBeenCalledWith(executor);
    });

    it('should throw an error if executor is not registered', () => {
      class TestExec extends PostboyExecutor<string> {
        static ID = Forger.create<string>({stringSpecial: false})!;
      }

      const executor = new TestExec();
      //
      expect(() => service.exec(executor)).toThrow(new RegExp('.?' + TestExec.ID + '.?', "g"));
    });
  });

  describe('unregister', () => {
    it('should unregister an application without errors', () => {
      class TestMessage extends PostboyGenericMessage {
        static ID = Forger.create<string>()!;
      }

      const subject = new Subject<TestMessage>();
      service.record(TestMessage, subject);
      //
      expect(() => service.unregister(TestMessage.ID)).not.toThrow();
    });
  });

  describe('subscribe', () => {
    it('should return an observable for a registered ID', () => {
      class TestMessage extends PostboyGenericMessage {
        static ID = Forger.create<string>()!;
      }

      const subject = new Subject<TestMessage>();
      service.record(TestMessage, subject);
      //
      const observable = service.sub(TestMessage);
      //
      expect(observable).toBeInstanceOf(Observable);
    });

    it('should throw an error if the ID is not registered', () => {
      class TestMessage extends PostboyGenericMessage {
        static ID = Forger.create<string>()!;
      }
      expect(() => service.sub(TestMessage)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('fire', () => {
    it('should fire a registered event and notify subscribers', () => {
      const subject = new Subject<PostboyGenericMessage>();
      const message = {id: 'testEvent'} as PostboyGenericMessage;

      service.register('testEvent', subject);

      const spy = jest.fn();
      service.subscribe<PostboyGenericMessage>('testEvent').subscribe(spy);
      service.fire(message);

      expect(spy).toHaveBeenCalledWith(message);
    });

    it('should throw an error if no event is registered for the message ID', () => {
      class TestMessage extends PostboyGenericMessage {
        static ID = Forger.create<string>()!;
      }

      const message = new TestMessage();
      //
      expect(() => service.fire(message)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('fireCallback', () => {
    it('should fire a callback event and execute the action', () => {
      const subject = new Subject<PostboyCallbackMessage<string>>();
      const message = new (class extends PostboyCallbackMessage<string> {
        static ID = 'testCallback';
      })();
      const action = jest.fn();

      service.register('testCallback', subject);
      service.fireCallback(message, action);
      message.next('callback result');

      expect(action).toHaveBeenCalledWith('callback result');
    });

    it('should throw an error if no callback event is registered for the message ID', () => {
      class TestMessage extends PostboyCallbackMessage<string> {
        static ID = Forger.create<string>()!;
      }
      //
      const message = new TestMessage();
      //
      expect(() => service.fireCallback(message)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('record', () => {
    it('should register a message type with a subject', () => {
      const subject = new Subject<PostboyGenericMessage>();
      const messageType = class extends PostboyGenericMessage {
        static ID = 'testMessage';
      };

      expect(() => service.record(messageType, subject)).not.toThrow();
    });
  });
});
