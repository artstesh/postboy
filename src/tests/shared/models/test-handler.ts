import {PostboyExecutionHandler} from '../../../models/postboy-execution.handler';
import {TestExecutor} from './test-executor';

export class TestHandler extends PostboyExecutionHandler<string, TestExecutor<any>> {
  private _throwOnHandle = false;

  constructor(public toReturn: string) {
    super();
  }

  handle(executor: TestExecutor<any>): string {
    return this.toReturn;
  }

  public throwOnHandle(value: boolean): this {
    this._throwOnHandle = value;
    return this;
  }
}
