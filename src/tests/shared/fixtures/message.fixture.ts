import { Forger } from '@artstesh/forger';
import {TestCallbackMessage} from "../models/test-callback-message";
import {TestMessage} from "../models/test-message";

export class MessageFixture {
  static message(): TestMessage {
    return new TestMessage();
  }

  static callbackMessage(): TestCallbackMessage {
    return new TestCallbackMessage();
  }
}