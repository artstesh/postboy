import { PostboyExecutor } from '../../../models/postboy-executor';

export class TestExecutor<T> extends PostboyExecutor<T> {
  static readonly ID = 'test-executor';

  constructor(public value: string) {
    super();
  }
}
