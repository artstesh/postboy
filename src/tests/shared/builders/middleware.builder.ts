import {PostboyWorld} from "../harness/postboy-world";
import {MiddlewareFixture, MiddlewareHooks} from "../fixtures/middleware.fixture";

export class MiddlewareBuilder {
  observableIds: string[] = [];

  constructor(private world: PostboyWorld, ...observeIds: string[]) {
    this.observableIds = observeIds;
  }

  public active(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): this {
    this.world.trackMiddleware(MiddlewareFixture.active(this.observableIds, hooks))
    return this;
  }


  public interrupting(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'> = {}): this {
    this.world.trackMiddleware(MiddlewareFixture.interrupting(this.observableIds, hooks))
    return this;
  }

  public throwing(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): this {
    this.world.trackMiddleware(MiddlewareFixture.throwing(this.observableIds, hooks))
    return this;
  }

  public skipped(hooks: Omit<MiddlewareHooks, 'canHandle' | 'decision' | 'throwOnBefore'>={}): this {
    this.world.trackMiddleware(MiddlewareFixture.skipped(this.observableIds, hooks))
    return this;
  }
}
