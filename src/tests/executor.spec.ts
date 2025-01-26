import {Forger} from '@artstesh/forger';
import {should} from '@artstesh/it-should';
import {PostboyExecutor} from '../models/postboy-executor';
import {PostboyService} from '../postboy.service';

class TestExecutor extends PostboyExecutor<string> {
  public get id(): string {
    return TestExecutor.name;
  }

  constructor() {
    super();
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
      service.registerExecutor(TestExecutor.name, (e: TestExecutor) => result);
      //
      let entry = service.execute<TestExecutor, string>(new TestExecutor());
      should().string(entry).equals(result);
    });
  });

  it('record,execute success', () => {
    const result = Forger.create<string>()!;
    service.recordExecutor(TestExecutor, e => result);
    //
    let entry = service.exec<string>(new TestExecutor());
    should().string(entry).equals(result);
  });
})
