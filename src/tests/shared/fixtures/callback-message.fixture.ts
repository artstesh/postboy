import { TestCallbackMessage } from '../models/test-callback-message';

export class CallbackMessageFixture {
  static create(returns: string): TestCallbackMessage {
    return new TestCallbackMessage(returns);
  }
}
