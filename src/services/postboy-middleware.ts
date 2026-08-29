import { PipelineContext } from '../models/pipeline-context';
import { MiddlewareDecisionType } from '../models/middleware-decision.enum';
import { MiddlewareDecision } from '../models';

/**
 * Base class for custom middleware — the "customs officers" inspecting everything that
 * travels through the bus.
 *
 * A middleware joins the pipeline via `AddMiddleware` and leaves it via
 * `RemoveMiddleware`, which also calls {@link dispose}. For every operation the hooks
 * run per stage (`Publish` for `fire`, `Callback` for `fireCallback`, `Execute` for
 * `exec` — see {@link MiddlewareStage}): {@link canHandle} is consulted first, then
 * {@link before} ahead of the operation, then {@link after} once it has finished.
 * Hooks run for infrastructure messages too — filter with {@link canHandle} if needed.
 *
 * Put validation and gating into {@link before}: returning an interrupt decision there
 * cancels the operation with a {@link CancelError}. Put logging and other side effects
 * into {@link after}.
 *
 * @example
 * ```ts
 * class AuthMiddleware extends PostboyMiddleware {
 *   canHandle(context: PipelineContext): boolean {
 *     return context.stage === MiddlewareStage.Execute;
 *   }
 *
 *   before(context: PipelineContext): MiddlewareDecision {
 *     return isAllowed(context.message)
 *       ? { type: MiddlewareDecisionType.Continue }
 *       : { type: MiddlewareDecisionType.Interrupt };
 *   }
 * }
 *
 * postboy.exec(new AddMiddleware(new AuthMiddleware()));
 * ```
 */
export abstract class PostboyMiddleware {
  /** Identifies the middleware in {@link CancelError} details; defaults to the class name. */
  public readonly name: string;

  /**
   * @param name - Custom name reported on cancellation; defaults to the class name.
   */
  constructor(name?: string) {
    this.name = name ?? this.constructor.name;
  }

  /**
   * Decides whether this middleware participates for the given context. Override to
   * narrow the middleware by stage or message id. Default: handle everything.
   */
  public canHandle(_context: PipelineContext): boolean {
    return true;
  }

  /**
   * Runs ahead of the operation. Return an interrupt decision
   * ({@link MiddlewareDecisionType.Interrupt}) to cancel it: the bus then throws a
   * {@link CancelError}, and the operation and all `after` hooks are skipped.
   * Default: continue.
   */
  public before(_context: PipelineContext): MiddlewareDecision {
    return { type: MiddlewareDecisionType.Continue };
  }

  /**
   * Runs after the operation has finished successfully. `result` carries the executor's
   * return value on the `Execute` stage and is `undefined` on `Publish` and `Callback`.
   * Default: no-op.
   */
  public after(_context: PipelineContext, _result?: unknown): void {
    // noop
  }

  /** Cleanup hook called on `RemoveMiddleware` and on bus disposal. Default: no-op. */
  public dispose(): void {
    // noop
  }
}
