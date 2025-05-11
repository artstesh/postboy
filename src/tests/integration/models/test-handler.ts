import {PostboyExecutionHandler} from "../../../models/postboy-execution.handler";
import {TestExecutor} from "./test-executor";

export class TestHandler extends PostboyExecutionHandler<string,TestExecutor>{

  constructor(public toReturn: string) {
    super();
  }

  handle(executor: TestExecutor): string {
    return this.toReturn;
  }
}
