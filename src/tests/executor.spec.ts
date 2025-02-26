import {Forger} from '@artstesh/forger';
import {should} from '@artstesh/it-should';
import {PostboyExecutor} from '../models/postboy-executor';
import {PostboyService} from '../postboy.service';
import {PostboyExecutionHandler} from "../models/postboy-execution.handler";

class TestExecutor extends PostboyExecutor<string> {
  static ID = Forger.create<string>()!;
}

class TestHandler extends PostboyExecutionHandler<string, TestExecutor> {
  public value = '';

  handle(executor: TestExecutor): string {
    return this.value;
  }
}

describe('Executor', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
  });

  afterEach(() => {
  });

  describe('executors', () => {
    it('register,execute success', () => {
      const result = Forger.create<string>()!;
      service.registerExecutor(TestExecutor.ID, (e: TestExecutor) => result);
      //
      let entry = service.execute<TestExecutor, string>(new TestExecutor());
      should().string(entry).equals(result);
    });
  });

  it('record,execute success', () => {
    const result = Forger.create<string>()!;
    service.recordExecutor(TestExecutor, (e) => result);
    //
    let entry = service.exec<string>(new TestExecutor());
    should().string(entry).equals(result);
  });
});


describe('ExecutorHandler', () => {
  let service: PostboyService;
  let handler:TestHandler;

  beforeEach(() => {
    handler = new TestHandler();
    handler.value = Forger.create<string>()!;
    service = new PostboyService();
  });

  it('record,execute success', () => {
    service.recordHandler(TestExecutor, handler);
    //
    let entry = service.exec<string>(new TestExecutor());
    should().string(entry).equals(handler.value);
  });
});
