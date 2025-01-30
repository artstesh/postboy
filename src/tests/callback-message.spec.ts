import { Forger } from '@artstesh/forger';
import { Subject } from 'rxjs';
import { should } from '@artstesh/it-should';
import { PostboyService } from '../postboy.service';
import { PostboyCallbackMessage } from '../models/postboy-callback.message';

class TestEvent extends PostboyCallbackMessage<string> {
  static ID = 'test-event';
}

describe('CallbackMessage', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
    service.record(TestEvent, new Subject<TestEvent>());
  });

  afterEach(() => {});

  it('success', () => {
    let testEvent = new TestEvent();
    const expected = Forger.create<string>()!;
    let gotValue: string;
    service.fireCallback(testEvent, (e) => (gotValue = e));
    //
    testEvent.finish(expected);
    //
    should().string(gotValue!).equals(expected);
  });
});
