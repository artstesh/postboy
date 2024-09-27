import {Forger} from '@artstesh/forger';
import {should} from '@artstesh/it-should';
import {PostboyExecutor} from "../models/postboy-executor";
import {PostboyService} from "../postboy.service";

class TestExecutor extends PostboyExecutor<string> {
  public get id() {
    return TestExecutor.ID;
  }

  public static ID = 'TestExecutor';

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
    it('success', () => {
      const result = Forger.create<string>()!;
      service.registerExecutor(TestExecutor.ID, (e: TestExecutor) => result);
      //
      should().string(service.execute(new TestExecutor())).equals(result);
    });
  });
});
