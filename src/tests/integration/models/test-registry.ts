import {PostboyAbstractRegistrator} from "../../../postboy-abstract.registrator";
import {TestPostboy} from "./test-postboy";
import {TestMessage} from "./test-message";
import {TestCallbackMessage} from "./test-callback-message";

export class TestReg extends PostboyAbstractRegistrator {
  ups: ((r: this) => void)[] = []

  constructor(postboy: TestPostboy) {
    super(postboy);
  }

  protected _up(): void {
    this.ups.forEach(up => up(this));
  }
}
