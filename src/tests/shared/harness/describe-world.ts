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

/*
import { itWithWorld } from '../../shared/harness/jest-helper';
import { PostboyWorld } from '../../shared/harness/postboy-world';

itWithWorld(
  () => new PostboyWorld(),
  'should complete callback message on finish',
  async (world) => {
    world.createPostboy();
    world.createRegistry();

    const message = world.createCallbackMessage();

    const completed = new Promise<void>((resolve) => {
      message.result.subscribe({
        complete: () => resolve(),
      });
    });

    world.get('postboy').fireCallback(message);

    message.finish('ok');

    await expect(completed).resolves.toBeUndefined();
  },
);


import { describeWithWorld } from '../../shared/harness/jest-helper';
import { PostboyWorld } from '../../shared/harness/postboy-world';

describeWithWorld('Integration.Messages.Fire', () => new PostboyWorld(), ({ it, beforeEach }) => {
  beforeEach(async (world) => {
    world.createPostboy();
    world.createRegistry();
  });

  it('should deliver fired message to subscriber', async (world) => {
    const received: unknown[] = [];
    const sub = world.get('postboy').sub('message-type').subscribe((value: unknown) => {
      received.push(value);
    });

    world.trackSubscription(sub);

    world.get('postboy').fire({ type: 'message-type', payload: 123 });

    expect(received).toEqual([{ type: 'message-type', payload: 123 }]);
  });
});
*/
