import {PostboyCallbackMessage} from "../../../models/postboy-callback.message";

export class TestCallbackMessage extends PostboyCallbackMessage<string> {
  static ID = 'test-callback-message';
  type = TestCallbackMessage;
}
