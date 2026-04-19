import {PostboyMessage} from '../models/postboy.message';
import {PostboyMessageContext} from '../models/postboy-message.context';
import {PostboyExecutor} from '../models/postboy-executor';
import {PipelineContext} from "../models/pipeline-context";
import {PostboyMiddleware} from "./postboy-middleware";
import {MiddlewareStage} from "../models/middleware-stage.enum";
import {MiddlewareDecision} from "../models/middleware-decision.enum";
import {CancelError} from "../models/cancel-error";


export class PostboyMiddlewareService {
  protected middlewares: PostboyMiddleware[] = [];

  public addMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares.push(middleware);
  }

  public removeMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares = this.middlewares.filter((m) => {
      if (m !== middleware) return true
      m.dispose();
      return false
    });
  }

  public dispose(): void {
    this.middlewares.forEach((m) => m.dispose());
    this.middlewares = [];
  }

  public before<T extends PostboyMessage>(
    stage: MiddlewareStage,
    message: T,
    messageContext?: PostboyMessageContext,
  ): void {
    for (const middleware of this.middlewares) {
      const context = this.buildContext(stage, message, messageContext);
      if (!middleware.canHandle(context)) continue;
      if (middleware.before(context) === MiddlewareDecision.Interrupt) this.throwIfCancelled(stage, middleware.name, message.id);
    }
  }

  public after<T extends PostboyMessage, R = unknown>(
    stage: MiddlewareStage,
    message: T,
    messageContext?: PostboyMessageContext,
    result?: R,
  ): void {
    for (const middleware of this.middlewares) {
      const context = this.buildContext(stage, message, messageContext);
      if (!middleware.canHandle(context)) continue;
      middleware.after(context, result);
    }
  }

  public beforePublish(
    message: PostboyMessage,
    messageContext?: PostboyMessageContext,
  ): void {
    this.before(MiddlewareStage.Publish, message, messageContext);
  }

  public afterPublish(
    message: PostboyMessage,
    messageContext?: PostboyMessageContext,
  ): void {
    this.after(MiddlewareStage.Publish, message, messageContext);
  }

  public beforeCallback(
    message: PostboyMessage,
    messageContext?: PostboyMessageContext,
  ): void {
    this.before(MiddlewareStage.Callback, message, messageContext);
  }

  public afterCallback(
    message: PostboyMessage,
    messageContext?: PostboyMessageContext,
    result?: unknown,
  ): void {
    this.after(MiddlewareStage.Callback, message, messageContext, result);
  }

  public beforeExecute<T>(
    message: PostboyExecutor<T>,
    messageContext?: PostboyMessageContext,
  ): void {
    this.before(MiddlewareStage.Execute, message, messageContext);
  }

  public afterExecute<T>(
    message: PostboyExecutor<T>,
    result: T,
    messageContext?: PostboyMessageContext,
  ): void {
    this.after(MiddlewareStage.Execute, message, messageContext, result);
  }

  private buildContext<T extends PostboyMessage>(
    stage: MiddlewareStage,
    message: T,
    messageContext?: PostboyMessageContext,
  ): PipelineContext<T> {
    return {stage, message, messageContext};
  }

  private throwIfCancelled(
    stage: MiddlewareStage,
    cancelledBy?: string,
    messageId?: string,
    namespace?: string,
  ): never {
    throw new CancelError({
      stage,
      middleware: cancelledBy,
      messageId,
      namespace,
      reason: cancelledBy ? `Cancelled by middleware "${cancelledBy}"` : undefined,
    });
  }
}
