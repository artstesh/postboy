import { Forger } from '@artstesh/forger';
import {TestCallbackMessage} from "../models/test-callback-message";
import {TestMessage} from "../models/test-message";
import {TestExecutor} from "../models/test-executor";
import {TestHandler} from "../models/test-handler";

export class MessageFixture {
  static message(): TestMessage {
    return new TestMessage();
  }

  static callbackMessage(): TestCallbackMessage {
    return new TestCallbackMessage();
  }

  static executor(): TestExecutor<any> {
    return new TestExecutor<any>(Forger.create<string>()!);
  }

  static handler(toReturn?: any): TestHandler {
    return new TestHandler(toReturn ?? Forger.create<string>()!);
  }
}
