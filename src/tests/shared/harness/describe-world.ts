import { TestWorld } from './test-world';

export type JestScenario<TWorld extends TestWorld<any>> = (world: TWorld) => void | Promise<void>;

export function describeWithWorld<TWorld extends TestWorld<any>>(
  title: string,
  worldFactory: () => TWorld,
  suite: (api: {
    it: (name: string, scenario: JestScenario<TWorld>) => void;
    beforeEach: (hook: JestScenario<TWorld>) => void;
    afterEach: (hook: JestScenario<TWorld>) => void;
  }) => void,
): void {
  describe(title, () => {
    let world: TWorld;

    beforeEach(() => {
      world = worldFactory();
    });

    afterEach(async () => {
      if (world) {
        await world.dispose();
      }
    });

    const api = {
      it: (name: string, scenario: JestScenario<TWorld>) => {
        test(name, async () => {
          await scenario(world);
        });
      },
      beforeEach: (hook: JestScenario<TWorld>) => {
        global.beforeEach(async () => {
          await hook(world);
        });
      },
      afterEach: (hook: JestScenario<TWorld>) => {
        global.afterEach(async () => {
          await hook(world);
        });
      },
    };

    suite(api);
  });
}

export function itWithWorld<TWorld extends TestWorld<any>>(
  worldFactory: () => TWorld,
  name: string,
  scenario: JestScenario<TWorld>,
): void {
  it(name, async () => {
    const world = worldFactory();
    try {
      await scenario(world);
    } finally {
      await world.dispose();
    }
  });
}

export async function runWithWorld<TWorld extends TestWorld<any>>(
  worldFactory: () => TWorld,
  scenario: JestScenario<TWorld>,
): Promise<void> {
  const world = worldFactory();
  try {
    await scenario(world);
  } finally {
    await world.dispose();
  }
}
