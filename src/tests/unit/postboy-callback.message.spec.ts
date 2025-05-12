import { PostboyCallbackMessage } from '../../models/postboy-callback.message';
import { Forger } from '@artstesh/forger';
import { should } from '@artstesh/it-should';

class TestPostboyCallbackMessage extends PostboyCallbackMessage<string> {
  static ID = 'test';
}

describe('PostboyCallbackMessage', () => {
  let message: TestPostboyCallbackMessage;

  beforeEach(() => {
    message = new TestPostboyCallbackMessage();
  });

  it('should emit a value with next method', (done) => {
    const value = Forger.create<string>()!;
    //
    message.result.subscribe((r) => {
      expect(r).toEqual(value);
      done();
    });
    //
    message.next(value);
  });

  it('should emit and complete with finish method', (done) => {
    const value = Forger.create<string>()!;
    //
    message.result.subscribe((r) => {
      expect(r).toEqual(value);
      done();
    });
    //
    message.finish(value);
  });

  it('should complete the result observable after calling finish', (done) => {
    message.result.subscribe({
      complete: () => {
        should().true(true);
        done();
      },
    });
    //
    message.finish(Forger.create<string>()!);
  });
});
