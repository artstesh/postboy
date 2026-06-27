import { TestWorld } from './test-world';
import { runScenario } from './lifecycle';

export type Step<TWorld extends TestWorld<any>> = (world: TWorld) => void | Promise<void>;

export interface ScenarioSteps<TWorld extends TestWorld<any>> {
  given?: Step<TWorld>;
  when?: Step<TWorld>;
  then?: Step<TWorld>;
  cleanup?: Step<TWorld>;
}

export interface TestRunnerOptions<TWorld extends TestWorld<any>> {
  worldFactory: () => TWorld;
  autoDispose?: boolean;
}

export class TestRunner<TWorld extends TestWorld<any>> {
  private readonly worldFactory: () => TWorld;
  private readonly autoDispose: boolean;

  constructor(options: TestRunnerOptions<TWorld>) {
    this.worldFactory = options.worldFactory;
    this.autoDispose = options.autoDispose !== false;
  }

  async run(handler: Step<TWorld>): Promise<void> {
    if (this.autoDispose) {
      await runScenario(this.worldFactory, handler);
      return;
    }

    const world = this.worldFactory();
    await handler(world);
  }

  async scenario(steps: ScenarioSteps<TWorld>): Promise<void> {
    await this.run(async (world) => {
      try {
        if (steps.given) {
          await steps.given(world);
        }

        if (steps.when) {
          await steps.when(world);
        }

        if (steps.then) {
          await steps.then(world);
        }
      } finally {
        if (steps.cleanup) {
          await steps.cleanup(world);
        }
      }
    });
  }
}
