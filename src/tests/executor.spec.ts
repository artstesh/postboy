import { Forger } from '@artstesh/forger';
import { should } from '@artstesh/it-should';
import { PostboyExecutor } from '../models/postboy-executor';
import { PostboyService } from '../postboy.service';

class TestExecutor extends PostboyExecutor<string> {
  static ID = 'b1c82888';
}

describe('Executor', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
  });

  afterEach(() => {});

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
