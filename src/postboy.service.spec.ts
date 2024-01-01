import { Forger } from '@artstesh/forger';
import { Subject } from 'rxjs';
import { should } from '@artstesh/it-should';
import { PostboyService } from './postboy.service';
import { PostboyGenericMessage } from './models/postboy-generic-message';
import { PostboyExecutor } from './models/postboy-executor';

class TestEvent extends PostboyGenericMessage {
  public static readonly ID = Forger.create<string>()!;
  id: string = TestEvent.ID;

  constructor(public value: number) {
    super();
  }
}
class TestExecutor extends PostboyExecutor<string> {
  public get id() {
    return TestExecutor.ID;
  }

  public static ID = 'TestExecutor';

  constructor() {
    super();
  }
}

describe('PostboyService', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
    service.register(TestEvent.ID, new Subject<TestEvent>());
  });

  afterEach(() => {});

  it('success', () => {
    let testEvent = new TestEvent(Forger.create<number>()!);
    let gotValue: number;
    service.subscribe<TestEvent>(TestEvent.ID).subscribe((e) => (gotValue = e.value));
    //
    service.fire(testEvent);
    //
    should().number(gotValue!).equals(testEvent.value);
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
