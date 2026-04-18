// import { MessageFixture } from '../fixtures/message.fixture';
// import {TestCallbackMessage} from "../models/test-callback-message";
// import {TestMessage} from "../models/test-message";
// import {PostboyMessage} from "../../../models/postboy.message";
//
// export class MessageBuilder<TMessage extends PostboyMessage> {
//   protected value: TMessage;
//
//   constructor(initial: TMessage) {
//     this.value = initial;
//   }
//
//   build(): TMessage {
//     return this.value;
//   }
// }
//
// export class TestMessageBuilder extends MessageBuilder<TestMessage> {
//   constructor() {
//     super(new TestMessage());
//   }
//
//   static create(): TestMessageBuilder {
//     return new TestMessageBuilder();
//   }
// }
//
// export class TestCallbackMessageBuilder extends MessageBuilder<TestCallbackMessage> {
//   constructor() {
//     super(MessageFixture.callbackMessage());
//   }
//
//   static create(): TestCallbackMessageBuilder {
//     return new TestCallbackMessageBuilder();
//   }
// }
