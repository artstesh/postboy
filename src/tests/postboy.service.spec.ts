import {Observable, Subject} from 'rxjs';
import {PostboyService} from '../postboy.service';
import {PostboyExecutor} from '../models/postboy-executor';
import {PostboyGenericMessage} from '../models/postboy-generic-message';
import {PostboyCallbackMessage} from '../models/postboy-callback.message';
import {Forger} from '@artstesh/forger';
import {PostboyLocker} from '../models/postboy.locker';

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
      //
      expect(() => service.recordExecutor(TestExec, jest.fn())).not.toThrow();
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
      expect(() => service.exec(executor)).toThrow(new RegExp('.?' + TestExec.ID + '.?', 'g'));
    });
  });

  describe('unregister', () => {
    it('unregisters an application without throwing errors', () => {
      class TestMessage extends PostboyGenericMessage {
        static ID = 'test-message';
      }

      service.record(TestMessage, new Subject<TestMessage>());
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
      //
      expect(() => service.sub(TestMessage)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('fire', () => {
    class TestMessage extends PostboyGenericMessage {
      static ID = Forger.create<string>()!;
    }

    it('should fire a registered event and notify subscribers', () => {
      const message = new TestMessage();
      service.record(TestMessage, new Subject<TestMessage>());
      const spy = jest.fn();
      service.sub(TestMessage).subscribe(spy);
      //
      service.fire(new TestMessage());
      //
      expect(spy).toHaveBeenCalledWith(message);
    });

    it('should throw an error if no event is registered for the message ID', () => {
      const message = new TestMessage();
      //
      expect(() => service.fire(message)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('fireCallback', () => {
    class TestMessage extends PostboyCallbackMessage<string> {
      static ID = Forger.create<string>()!;
    }

    it('should fire a callback event and execute the action', () => {
      expect.assertions(1);
      const text = Forger.create<string>()!;
      const message = new TestMessage();
      service.record(TestMessage, new Subject());
      //
      service.fireCallback(message, (t) => expect(t).toBe(text));
      message.finish(text);
    });

    it('should fire a callback event and execute the action - 2', () => {
      expect.assertions(1);
      const text = Forger.create<string>()!;
      const message = new TestMessage();
      service.record(TestMessage, new Subject());
      //
      service.fireCallback(message).subscribe((t) => expect(t).toBe(text));
      message.finish(text);
    });

    it('should throw an error if no callback event is registered for the message ID', () => {
      //
      const message = new TestMessage();
      //
      expect(() => service.fireCallback(message)).toThrow(/.?TestMessage.?/g);
    });
  });

  describe('record', () => {
    it('should register a message type with a subject', () => {
      class TestMessage extends PostboyCallbackMessage<string> {
        static ID = Forger.create<string>()!;
      }
      //
      expect(() => service.record(TestMessage, new Subject())).not.toThrow();
    });
  });
});
