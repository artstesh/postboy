import { Forger } from '@artstesh/forger';
import { Subject } from 'rxjs';
import { should } from '@artstesh/it-should';
import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {PostboyService} from "../postboy.service";
import {PostboyCallbackMessage} from "../models/postboy-callback.message";

class TestEvent extends PostboyCallbackMessage<string> {
  public static readonly ID = Forger.create<string>()!;
  id: string = TestEvent.ID;

  constructor() {
    super();
  }
}

describe('CallbackMessage', () => {
  let service: PostboyService;

  beforeEach(() => {
    service = new PostboyService();
    service.register(TestEvent.ID, new Subject<TestEvent>());
  });

  afterEach(() => {});

  it('success', () => {
    let testEvent = new TestEvent();
    const expected = Forger.create<string>()!;
    let gotValue: string;
    testEvent.result.subscribe((e) => (gotValue = e));
    service.fire(testEvent);
    //
    testEvent.finish(expected)
    //
    should().string(gotValue!).equals(expected);
  });
});
