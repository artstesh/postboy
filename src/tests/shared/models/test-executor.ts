import { PostboyExecutor } from '../../../models/postboy-executor';

export class TestExecutor<T> extends PostboyExecutor<T> {
  static readonly ID: string = '581e1699-2a0f-482e-b2ea-14682fbfd31c';
  type = TestExecutor;

  constructor(public value?: string) {
    super();
  }
}
