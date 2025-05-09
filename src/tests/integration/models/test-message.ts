import {PostboyGenericMessage} from "../../../models/postboy-generic-message";

export class TestMessage extends PostboyGenericMessage {
  static ID = 'test-message';
  type = TestMessage;
}
