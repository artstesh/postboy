# Test architecture

Four tiers, each runnable in isolation:

| Tier | Location | Script | What it covers |
|---|---|---|---|
| Unit | `src/tests/unit/` | `npm run test:unit` | One class per spec, collaborators mocked with `ts-mockito`, fake data via `@artstesh/forger`. |
| Integration | `src/tests/integration/` | `npm run test:integration` | Behavioral scenarios on a real `PostboyService`, built with the shared harness (`ScenarioBuilder` + `PostboyWorld`). |
| Stress | `src/tests/stress/` | `npm run test:stress` | Correctness under heavy load: 10k messages, subscriber churn, namespace churn, disposal under load. Longer timeouts. |
| Bench | `src/tests/bench/` | `npm run bench` | Performance benchmarks via `tinybench` (not Jest): fire throughput, middleware overhead, callback round-trip, subscribe churn. |

## Scripts

- `npm test` — all Jest projects (unit + integration + stress).
- `npm run test:coverage` — same suite with coverage collection; thresholds: 90% lines/statements/functions, 85% branches (barrel `index.ts` files are excluded).
- `npm run typecheck` — type-checks both `src` and the specs (`tsconfig.test.json`).
- `npm run lint` / `npm run format` — ESLint + prettier over all `src/**/*.ts`, tests included.

## Conventions

- File names: `*.spec.ts`; integration suites describe as `Integration.<Area>.<Aspect>`, scenario files end with `.scenario.spec.ts`.
- Arrange/act/assert separated by a `//` comment, mirroring the existing unit specs.
- Assertions: `@artstesh/it-should` (`should()...`) or the `TestAssertions` helpers from the harness; plain `expect` where a matcher is missing.
- Integration tests use the fluent builders (`ScenarioBuilder`, `SubscriptionBuilder`, `MiddlewareBuilder`) and never construct collaborators by hand; fixtures live in `src/tests/shared/fixtures/`.
- Bench files (`*.bench.ts`) are excluded from Jest and from the published build.
