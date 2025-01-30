import { Forger } from '@artstesh/forger';
import { Subject } from 'rxjs';
import { should } from '@artstesh/it-should';
import { PostboyGenericMessage } from '../models/postboy-generic-message';
import { PostboyService } from '../postboy.service';
import {PostboyCallbackMessage} from "../models/postboy-callback.message";

class TestEvent extends PostboyGenericMessage {
  static ID = 'b1c82888';

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

  it('throws without id', () => {
    class ErrorEvent extends PostboyGenericMessage {    }
    //
    expect(() =>service.record(ErrorEvent, new Subject<ErrorEvent>())).toThrow();
  })
});
