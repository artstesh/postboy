import { PostboyGenericMessage } from '../../../models/postboy-generic-message';

export class TestMessage extends PostboyGenericMessage {
  static ID: string = 'b640f6b9-192e-44dd-8313-7592e09e5eb2';
  type = TestMessage;

  constructor(public value: string) {
    super();
  }
}
