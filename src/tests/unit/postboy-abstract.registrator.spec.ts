// postboy-abstract.registrator.spec.ts
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';
import {PostboyAbstractRegistrator} from "../../postboy-abstract.registrator";
import {PostboyService} from "../../postboy.service";
import {IPostboyDependingService} from "../../i-postboy-depending.service";
import {PostboyGenericMessage} from "../../models/postboy-generic-message";
import {PostboyExecutor} from "../../models/postboy-executor";
import {Forger} from "@artstesh/forger";

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
  let postboyService: jest.Mocked<PostboyService>;
  let registrator: TestPostboyRegistrator;

  beforeEach(() => {
    postboyService = {
      unregister: jest.fn(),
      record: jest.fn(),
      recordWithPipe: jest.fn(),
      recordExecutor: jest.fn(),
      recordHandler: jest.fn(),
    } as unknown as jest.Mocked<PostboyService>;

    registrator = new TestPostboyRegistrator(postboyService);
  });

  describe('registerServices', () => {
    it('should register the given services', () => {
      const services: IPostboyDependingService[] = [{up: jest.fn()}, {up: jest.fn()}];

      registrator.registerServices(services);

      expect((registrator as any).services).toEqual(services);
    });
  });

  describe('up', () => {
    it('should call _up and up on registered services', () => {
      const services: IPostboyDependingService[] = [{up: jest.fn()}, {up: jest.fn()}];
      registrator.registerServices(services);

      registrator.up();

      services.forEach((service) => {
        expect(service.up).toHaveBeenCalled();
      });
    });
  });

  describe('down', () => {
    it('should unregister all id entries and clear services', () => {
      (registrator as any).ids = ['id1', 'id2'];
      const unregisterSpy = jest.spyOn(postboyService, 'unregister');
      //
      registrator.down();
      //
      expect(unregisterSpy).toHaveBeenCalledWith('id1');
      expect(unregisterSpy).toHaveBeenCalledWith('id2');
      expect(unregisterSpy).toHaveBeenCalledTimes(2);
      expect((registrator as any).services).toEqual([]);
    });
  });

  describe('record', () => {
    it('should add id and call postboyService.record', () => {
      const subject = new Subject<TestMessage>();
      //
      const result = registrator.record(TestMessage, subject);
      //
      expect((registrator as any).ids).toContain(TestMessage.ID);
      expect(postboyService.record).toHaveBeenCalledWith(TestMessage, subject);
      expect(result).toBe(registrator);
    });
  });

  describe('recordWithPipe', () => {
    it('should add id and call postboyService.recordWithPipe', () => {
      const subject = new Subject<TestMessage>();
      const pipeFn = jest.fn();
      //
      const result = registrator.recordWithPipe(TestMessage, subject, pipeFn);
      //
      expect((registrator as any).ids).toContain(TestMessage.ID);
      expect(postboyService.recordWithPipe).toHaveBeenCalledWith(TestMessage, subject, pipeFn);
      expect(result).toBe(registrator);
    });
  });

  describe('recordExecutor', () => {
    it('should call postboyService.recordExecutor with provided executor and logic', () => {
      const executorLogic = jest.fn();
      //
      registrator.recordExecutor(TestExec, executorLogic);
      //
      expect(postboyService.recordExecutor).toHaveBeenCalledWith(TestExec, executorLogic);
    });
  });

  describe('recordHandler', () => {
    it('should call postboyService.recordHandler with provided executor and handler', () => {
      const handler = {handle: jest.fn()};
      //
      registrator.recordHandler(TestExec, handler);
      //
      expect(postboyService.recordHandler).toHaveBeenCalledWith(TestExec, handler);
    });
  });

  describe('recordReplay', () => {
    it('should call record with ReplaySubject and given bufferSize', () => {
      const bufferSize = Forger.create<number>()!;
      //
      registrator.recordReplay(TestMessage, bufferSize);
      //
      expect(postboyService.record).toHaveBeenCalledWith(TestMessage, expect.any(ReplaySubject));
    });
  });

  describe('recordBehavior', () => {
    it('should call record with BehaviorSubject and initial value', () => {
      registrator.recordBehavior(TestMessage, new TestMessage());
      //
      expect(postboyService.record).toHaveBeenCalledWith(TestMessage, expect.any(BehaviorSubject));
    });
  });

  describe('recordSubject', () => {
    it('should call record with a new Subject instance', () => {
      registrator.recordSubject(TestMessage);
      //
      expect(postboyService.record).toHaveBeenCalledWith(TestMessage, expect.any(Subject));
    });
  });
});
