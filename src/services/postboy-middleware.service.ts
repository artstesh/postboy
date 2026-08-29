import { PostboyMessage } from '../models/postboy.message';
import { PostboyMessageContext } from '../models/postboy-message.context';
import { PostboyExecutor } from '../models/postboy-executor';
import { PipelineContext } from '../models/pipeline-context';
import { PostboyMiddleware } from './postboy-middleware';
import { MiddlewareStage } from '../models/middleware-stage.enum';
import { MiddlewareDecisionType } from '../models/middleware-decision.enum';
import { CancelError } from '../models/cancel-error';

/**
 * The middleware pipeline of the bus: keeps the chain in insertion order and drives the
 * hooks around every operation. Consumer code does not call it directly — middleware is
 * managed through the `AddMiddleware`/`RemoveMiddleware` messages.
 */
export class PostboyMiddlewareService {
  /** The middleware chain, in insertion order. */
  protected middlewares: PostboyMiddleware[] = [];

  /** Appends the middleware to the end of the chain; appending the same instance twice runs its hooks twice. */
  public addMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares.push(middleware);
  }

  /** Removes the middleware by identity and calls its `dispose()` hook; unknown instances are ignored. */
  public removeMiddleware(middleware: PostboyMiddleware): void {
    this.middlewares = this.middlewares.filter((m) => {
      if (m !== middleware) return true;
      m.dispose();
      return false;
    });
  }

  /** Disposes every middleware in the chain and empties it. */
  public dispose(): void {
    this.middlewares.forEach((m) => m.dispose());
    this.middlewares = [];
  }

  /**
   * Runs the `before` hooks for the stage, consulting `canHandle` on each middleware.
   * Stops and throws {@link CancelError} as soon as one returns an interrupt decision.
   *
   * @throws CancelError With the stage, middleware name, and message id of the interruption.
   */
  public before<T extends PostboyMessage>(stage: MiddlewareStage, message: T): void {
    for (const middleware of this.middlewares) {
      const context = this.buildContext(stage, message);
      if (!middleware.canHandle(context)) continue;
      if (middleware.before(context).type === MiddlewareDecisionType.Interrupt)
        this.throwIfCancelled(stage, middleware.name, message.id);
    }
  }

  /** Runs the `after` hooks for the stage, passing the executor result when there is one. */
  public after<T extends PostboyMessage, R = unknown>(stage: MiddlewareStage, message: T, result?: R): void {
    for (const middleware of this.middlewares) {
      const context = this.buildContext(stage, message);
      if (!middleware.canHandle(context)) continue;
      middleware.after(context, result);
    }
  }

  /** `before` hooks for the `Publish` stage (`PostboyService.fire`). */
  public beforePublish(message: PostboyMessage): void {
    this.before(MiddlewareStage.Publish, message);
  }

  /** `after` hooks for the `Publish` stage (`PostboyService.fire`). */
  public afterPublish(message: PostboyMessage): void {
    this.after(MiddlewareStage.Publish, message);
  }

  /** `before` hooks for the `Callback` stage (`PostboyService.fireCallback`). */
  public beforeCallback(message: PostboyMessage): void {
    this.before(MiddlewareStage.Callback, message);
  }

  /** `after` hooks for the `Callback` stage — run on every emitted result value. */
  public afterCallback(message: PostboyMessage, result?: unknown): void {
    this.after(MiddlewareStage.Callback, message, result);
  }

  /** `before` hooks for the `Execute` stage (`PostboyService.exec`). */
  public beforeExecute<T>(message: PostboyExecutor<T>): void {
    this.before(MiddlewareStage.Execute, message);
  }

  /** `after` hooks for the `Execute` stage, receiving the executor's return value. */
  public afterExecute<T>(message: PostboyExecutor<T>, result: T): void {
    this.after(MiddlewareStage.Execute, message, result);
  }

  private buildContext<T extends PostboyMessage>(stage: MiddlewareStage, message: T): PipelineContext<T> {
    return { stage, message };
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
