import { TestWorld } from './test-world';

export type ScenarioHandler<TWorld extends TestWorld<any>> =
  (world: TWorld) => void | Promise<void>;

export interface ScenarioOptions<TWorld extends TestWorld<any>> {
  worldFactory?: () => TWorld;
  beforeEach?: (world: TWorld) => void | Promise<void>;
  afterEach?: (world: TWorld) => void | Promise<void>;
}

export async function withWorld<TWorld extends TestWorld<any>>(
  worldFactory: () => TWorld,
  handler: ScenarioHandler<TWorld>,
  options: Pick<ScenarioOptions<TWorld>, 'beforeEach' | 'afterEach'> = {},
): Promise<void> {
  const world = worldFactory();

  try {
    if (options.beforeEach) {
      await options.beforeEach(world);
    }

    await handler(world);

    if (options.afterEach) {
      await options.afterEach(world);
    }
  } finally {
    await world.dispose();
  }
}

export function createWorldLifecycle<TWorld extends TestWorld<any>>(
  worldFactory: () => TWorld,
  options: Pick<ScenarioOptions<TWorld>, 'beforeEach' | 'afterEach'> = {},
) {
  return {
    run: (handler: ScenarioHandler<TWorld>) => withWorld(worldFactory, handler, options),
    create: () => worldFactory(),
  };
}

export async function runScenario<TWorld extends TestWorld<any>>(
  worldFactory: () => TWorld,
  handler: ScenarioHandler<TWorld>,
): Promise<void> {
  await withWorld(worldFactory, handler);
}

export async function runScenarioWithHooks<TWorld extends TestWorld<any>>(
  options: ScenarioOptions<TWorld>,
  handler: ScenarioHandler<TWorld>,
): Promise<void> {
  const factory = options.worldFactory ?? (() => new TestWorld() as TWorld);
  await withWorld(factory, handler, options);
}
