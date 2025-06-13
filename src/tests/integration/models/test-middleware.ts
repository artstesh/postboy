import {PostboyMiddleware} from "../../../models/postboy-middleware";
import {PostboyMessage} from "../../../models/postboy.message";

export class TestMiddleware implements PostboyMiddleware{
  fired?: PostboyMessage;

  handle(message: PostboyMessage): void {
    this.fired = message;
  }
}
