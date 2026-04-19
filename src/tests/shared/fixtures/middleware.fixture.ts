import { MiddlewareDecision } from '../../../models/middleware-decision.enum';
import { PipelineContext } from '../../../models/pipeline-context';
import { TestMiddleware } from '../models/test-middleware';

export type MiddlewareHooks = {
  canHandle?: boolean;
  decision?: MiddlewareDecision;
  throwOnBefore?: boolean;
  onBefore?: (context: PipelineContext) => void;
  onAfter?: (context: PipelineContext, result?: unknown) => void;
};

export class MiddlewareFixture {
  static create(acceptable: string[],hooks: MiddlewareHooks): TestMiddleware {
    const middleware = new TestMiddleware(acceptable);

    middleware._canHandle = hooks.canHandle ?? true;
    middleware._decision = hooks.decision ?? MiddlewareDecision.Continue;
    middleware._throw = hooks.throwOnBefore ?? false;

    if (hooks.onBefore) {
      const originalBefore = middleware.before.bind(middleware);
      middleware.before = ((context: PipelineContext) => {
        middleware.targetMessages.has(context.message.id) &&  hooks.onBefore?.(context);
        return originalBefore(context);
      }) as typeof middleware.before;
    }

    if (hooks.onAfter) {
      const originalAfter = middleware.after.bind(middleware);
      middleware.after = ((context: PipelineContext, result?: unknown) => {
        middleware.targetMessages.has(context.message.id) &&  hooks.onAfter?.(context, result);
        return originalAfter(context, result);
      }) as typeof middleware.after;
    }

    return middleware;
  }

  static active(acceptable: string[],hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): TestMiddleware {
    return this.create(acceptable,{
      canHandle: true,
      decision: MiddlewareDecision.Continue,
      ...hooks,
    });
  }

  static interrupting(acceptable: string[],hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): TestMiddleware {
    return this.create(acceptable,{
      canHandle: true,
      decision: MiddlewareDecision.Interrupt,
      ...hooks,
    });
  }

  static throwing(acceptable: string[],hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): TestMiddleware {
    return this.create(acceptable,{
      canHandle: true,
      throwOnBefore: true,
      ...hooks,
    });
  }

  static skipped(acceptable: string[],hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): TestMiddleware {
    return this.create(acceptable,{
      canHandle: false,
      ...hooks,
    });
  }
}
