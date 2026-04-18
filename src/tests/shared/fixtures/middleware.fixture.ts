import {PostboyMiddleware} from "../../../services/postboy-middleware";


// export class MiddlewareFixture {
//   static create(handle?: PostboyMiddleware['handle']): PostboyMiddleware {
//     return {
//       handle: handle ?? (() => undefined),
//     };
//   }
//
//   static spy(): PostboyMiddleware {
//     return {
//       handle: jest.fn(),
//     };
//   }
//
//   static error(error: unknown = new Error('Middleware error')): PostboyMiddleware {
//     return {
//       handle: jest.fn(() => {
//         throw error;
//       }),
//     };
//   }
//
//   static chain(...middlewares: PostboyMiddleware[]): PostboyMiddleware[] {
//     return middlewares;
//   }
// }

/*
``` ts
const middleware = MiddlewareFixture.spy();
world.trackMiddleware(middleware);
```

``` ts
const middleware = MiddlewareFixture.error();
world.trackMiddleware(middleware);
```

``` ts
const middlewares = MiddlewareFixture.chain(
  MiddlewareFixture.spy(),
  MiddlewareFixture.spy(),
);
```

 */
