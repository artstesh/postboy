import { PostboyWorld } from '../harness/postboy-world';
import {TestPostboy} from "../models/test-postboy";
import {PostboySettings} from "../../../models/postboy.settings";

export type PostboyFixtureOptions = {
  settings?: Partial<PostboySettings>;
  world?: PostboyWorld;
  postboy?: TestPostboy;
};

export class PostboyFixture {
  static create(options: PostboyFixtureOptions = {}): TestPostboy {
    const postboy = options.postboy ?? new TestPostboy();

    if (options.world) {
      options.world.createPostboy(postboy);
    }

    return postboy;
  }

  static createWithWorld(
    world: PostboyWorld,
    options: Omit<PostboyFixtureOptions, 'world'> = {},
  ): TestPostboy {
    return this.create({
      ...options,
      world,
    });
  }

  static world(options: PostboyFixtureOptions = {}): PostboyWorld {
    const world = options.world ?? new PostboyWorld();
    this.create({
      ...options,
      world,
    });

    return world;
  }

  static setup(world: PostboyWorld, options: Omit<PostboyFixtureOptions, 'world'> = {}): TestPostboy {
    const postboy = options.postboy ?? new TestPostboy();
    world.createPostboy(postboy);
    return postboy;
  }
}

/*
В integration тестах``` ts
const world = PostboyFixture.world();
const postboy = world.getPostboy();
```

В сценариях``` ts
const world = new PostboyWorld();
PostboyFixture.setup(world);
```

В builder-ах``` ts
const world = new PostboyWorld();
PostboyFixture.setup(world);
const scenario = new ScenarioBuilder(world);
```

 */
