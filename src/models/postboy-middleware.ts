import {PostboyMessage} from "./postboy.message";

export interface PostboyMiddleware {
  handle(message: PostboyMessage): void;
}
