import { PostboyGenericMessage } from '../../../models/postboy-generic-message';

export class TestExecutor extends PostboyGenericMessage {
  static readonly ID = 'test-executor';

  constructor(public value: string) {
    super();
  }
}
