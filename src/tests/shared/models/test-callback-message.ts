import { PostboyCallbackMessage } from '../../../models/postboy-callback.message';

export class TestCallbackMessage extends PostboyCallbackMessage<string> {
  static ID = 'b67ec656-7c25-4b2a-911c-71d6fc143fd0';
  type = TestCallbackMessage;
}
