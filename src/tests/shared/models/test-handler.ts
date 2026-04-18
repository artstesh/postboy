import { PostboyExecutionHandler } from '../../../models/postboy-execution.handler';
import { TestExecutor } from './test-executor';

export class TestHandler extends PostboyExecutionHandler<string, TestExecutor<any>> {
  constructor(public toReturn: string) {
    super();
  }

  handle(executor: TestExecutor<any>): string {
    return this.toReturn;
  }
}
