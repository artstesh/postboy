import {PostboyMiddleware} from "../models/postboy-middleware";
import {PostboyMessage} from "../models/postboy.message";

export class PostboyMiddlewareService {
  protected middlewares: PostboyMiddleware[] = [];

  public addMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares.push(middleware);
  }

  public removeMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares = this.middlewares.filter((m) => m !== middleware);
  }

  public manage(msg: PostboyMessage): void {
    for (const item of this.middlewares) item.handle(msg);
  }
}
