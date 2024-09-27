import { Forger } from '@artstesh/forger';
import { Subject } from 'rxjs';
import { should } from '@artstesh/it-should';
import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {PostboyService} from "../postboy.service";

class TestEvent extends PostboyGenericMessage {
  public static readonly ID = Forger.create<string>()!;
  id: string = TestEvent.ID;

  constructor(public value: number) {
    super();
  }
}

describe('GenericMessage', () => {
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
});
