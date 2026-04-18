import { MiddlewareDecision } from '../../../models/middleware-decision.enum';
import { PipelineContext } from '../../../models/pipeline-context';
import { TestMiddleware } from '../models/test-middleware';

type MiddlewareHooks = {
  canHandle?: boolean;
  decision?: MiddlewareDecision;
  throwOnBefore?: boolean;
  onBefore?: (context: PipelineContext) => void;
  onAfter?: (context: PipelineContext, result?: unknown) => void;
  onError?: (context: PipelineContext, error?: unknown) => void;
};

export class MiddlewareFixture {
  static create(hooks: MiddlewareHooks = {}): TestMiddleware {
    const middleware = new TestMiddleware();

    middleware._canHandle = hooks.canHandle ?? true;
    middleware._decision = hooks.decision ?? MiddlewareDecision.Continue;
    middleware._throw = hooks.throwOnBefore ?? false;

    if (hooks.onBefore) {
      const originalBefore = middleware.before.bind(middleware);
      middleware.before = ((context: PipelineContext) => {
        hooks.onBefore?.(context);
        return originalBefore(context);
      }) as typeof middleware.before;
    }

    if (hooks.onAfter) {
      const originalAfter = middleware.after.bind(middleware);
      middleware.after = ((context: PipelineContext, result?: unknown) => {
        hooks.onAfter?.(context, result);
        return originalAfter(context, result);
      }) as typeof middleware.after;
    }

    if (hooks.onError) {
      const originalOnError = middleware.onError.bind(middleware);
      middleware.onError = ((context: PipelineContext, error?: unknown) => {
        hooks.onError?.(context, error);
        return originalOnError(context, error);
      }) as typeof middleware.onError;
    }

    return middleware;
  }

  static active(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): TestMiddleware {
    return this.create({
      canHandle: true,
      decision: MiddlewareDecision.Continue,
      ...hooks,
    });
  }

  static interrupting(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): TestMiddleware {
    return this.create({
      canHandle: true,
      decision: MiddlewareDecision.Interrupt,
      ...hooks,
    });
  }

  static throwing(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): TestMiddleware {
    return this.create({
      canHandle: true,
      throwOnBefore: true,
      ...hooks,
    });
  }

  static skipped(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): TestMiddleware {
    return this.create({
      canHandle: false,
      ...hooks,
    });
  }

  static chain(...middlewares: TestMiddleware[]): TestMiddleware[] {
    return middlewares;
  }
}
