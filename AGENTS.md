# AGENTS.md

System context and instructions for the agent working with this repository.

> **Language rule:** all documentation, code comments, TSDoc, commit messages, and release notes in this project must be written in **English only**. This file is the single exception (kept bilingual-friendly) — no new Russian content.

## 1. 🎯 PROJECT OVERVIEW

**@artstesh/postboy** — a lightweight, typed message bus library for TypeScript/RxJS, built around a "postal service" metaphor (messages, subscriptions, middleware "customs officers", registrators). Published to npm as `@artstesh/postboy` (current branch `v3`, version 3.5.0). The audience is Angular/TS developers who need communication between components and services without direct dependencies. The library itself is framework-independent: the only peer dependency is `rxjs` (^7); Angular is not used at all.

Key features:
- Typed messages with a mandatory static `ID`.
- Synchronous executor commands and asynchronous callback messages (request/response via `Observable`).
- A staged middleware pipeline (v3.5): `Publish`/`Callback`/`Execute` stages, `before`/`after` hooks per stage, cancellation via `MiddlewareDecisionType.Interrupt` → `CancelError` with structured `CancelDetails`.
- Namespaces and registrators (`up()/down()`) for feature isolation and lifecycle management.
- Since v3 — a message-driven API: bus mutations (registration, middleware, lock, namespace) are performed via infrastructure messages/executors. In v3.5 the direct `PostboyService` mutation methods (`lock`, `unlock`, `addMiddleware`, `removeMiddleware`, `addNamespace`, `eliminateNamespace`, `unregister`) were **removed**; only `record`/`recordWithPipe`/`recordExecutor`/`recordHandler` remain, marked `@deprecated`.

Stack: TypeScript 5, RxJS 7, dual ESM/CJS build with `tsup` → `lib/` (`index.mjs` + `index.cjs` + `index.d.ts` + source maps; explicit `exports` map in `package.json`), tests with Jest 29 + ts-jest, linting with ESLint (typescript-eslint + eslint-plugin-prettier) and prettier 3, cleanup with `rimraf`, bundle analysis with `esbuild-visualizer`/`source-map-explorer`, test utilities `@artstesh/forger`, `@artstesh/it-should`, `ts-mockito`, `@artstesh/postboy-testing`. No database. No CI pipeline.

## 2. 📁 ARCHITECTURE & DIRECTORY STRUCTURE

```
src/
├── index.ts                        # public barrel export of the library
├── postboy.service.ts              # core: PostboyService, registers infrastructure messages
├── postboy-abstract.registrator.ts # base class for feature registrators (namespaces, up/down)
├── i-postboy-depending.service.ts  # up()/down() lifecycle interface
├── messages/                       # v3 infrastructure executor-messages:
│                                   #   add/remove-middleware, add/eliminate-namespace,
│                                   #   connect/disconnect-message, connect-executor/handler,
│                                   #   lock/unlock-message
├── models/                         # core abstractions:
│                                   #   PostboyMessage / PostboyGenericMessage (static ID),
│                                   #   PostboyCallbackMessage (async request/response),
│                                   #   PostboyExecutor / PostboyExecutionHandler,
│                                   #   PostboySubscription (Subject+pipe),
│                                   #   middleware pipeline types (MiddlewareStage/Decision,
│                                   #   PipelineContext, PipelineResult, CancelDetails, CancelError),
│                                   #   message metadata & context
├── services/                       # internal collaborators of PostboyService:
│                                   #   PostboyMessageStore, PostboyMiddlewareService (pipeline),
│                                   #   PostboyMiddleware (abstract base), PostboyNamespaceStore,
│                                   #   NamespaceRegistrator, PostboyDependencyResolver,
│                                   #   PostboyContextService (NOT exported, node:async_hooks)
├── utils/id.generator.ts
└── tests/
    ├── unit/                       # *.spec.ts covering services, stores, registrator, callback message
    └── integration/                # grouped by topic: callbacks/ executors/ messages/
                                    #   middleware/ namespaces/ layers/ scenarios/
lib/          # tsup build output (published to npm)
versions/     # release notes per version ("version 3.3.0.md", "version x.4.x.md", "version x.5.x.md")
AI_SKILL.md   # AI-agent context document for library CONSUMERS (shipped in the npm package)
```

Interaction logic: layered and unidirectional. `PostboyService` is a facade; it delegates to internal services (`PostboyMessageStore`, `PostboyMiddlewareService`, `PostboyNamespaceStore`) assembled via `PostboyDependencyResolver`. User code: create a message → `fire()`/`fireCallback()` → middleware pipeline (staged before/after hooks, may throw `CancelError` on interrupt) → subscription Subject; or an executor → `exec()` → registered handler. All bus mutations go through the infrastructure messages in `messages/` (`registerInfrastructureMessages()` in `postboy.service.ts`).

## 3. 📜 CODING GUIDELINES & RULES

**Naming:**
- Files: kebab-case with a dot-separated role suffix — `postboy.service.ts`, `connect-executor.executor.ts`, `postboy-middleware.ts`; interfaces get the `i-` prefix. Specs are `*.spec.ts`; integration specs get the `int-` prefix.
- Code: classes/interfaces PascalCase, members camelCase, encapsulation via `private`/`protected`.
- Commits: descriptive imperative sentences with backticked identifiers (`Remove \`PostboyContextService\`, update \`PostboyService\`...`); release commits are bare semver strings (`3.5.0`).

**Architectural prohibitions:**
- Do not add runtime dependencies beyond the `rxjs` peer dependency — the library must stay framework-independent and lightweight.
- Do not use the deprecated direct registration methods of `PostboyService` (`record`, `recordWithPipe`, `recordExecutor`, `recordHandler`) in new code — only the infrastructure messages from `src/messages/`. (The chainable `record*` methods of `PostboyAbstractRegistrator` are fine — they internally use the messages.) The removed methods (`lock`, `addMiddleware`, `addNamespace`, `unregister`, etc.) must not be reintroduced.
- Do not expose internal services (`PostboyContextService`, `PostboyDependencyResolver`, etc.) via the public `index.ts` export without a strong reason.
- Every new message must have a static `ID` (inherit from `PostboyGenericMessage`/`PostboyMessage`).
- Do not commit hand edits to `lib/` — it is generated build output (`npm run build` / tsup).
- Custom middleware must extend the abstract `PostboyMiddleware` (staged `canHandle`/`before`/`after`/`dispose` contract); the old single-`handle()` interface is gone.

**Error handling and documentation:**
- Public API is documented with TSDoc (`@param`, `@return`, `@deprecated` for deprecated API) — **in English**.
- Do not swallow errors silently; invalid operations (e.g., a message without an ID) must be checked explicitly (`checkId`) with predictable outcomes. Middleware cancellation surfaces as a `CancelError` with `CancelDetails`.
- There is no logging as such (it's a library) — do not introduce console calls in runtime code.

## 4. 🤖 AGENT WORKFLOW PROTOCOL

1. **Plan before code.** Before making changes, produce a step-by-step plan and get the user's approval (checkout). Especially for public API changes — this is a published npm package.
2. **Verify before finishing.** Before completing a task, always run:
   - `npm run lint` (ESLint with `--fix`);
   - `npm run typecheck` (`tsc --noEmit`);
   - `npm test` (Jest, unit + integration).
   All must pass cleanly.
3. **Iterate.** Changes are made in small atomic commits following the existing history style; every commit keeps the tests green.
4. **Formatting.** Before committing, run `npm run format` (prettier) for the touched `src/**/*.ts` files.
5. **Versioning/publishing** — only on the user's explicit request (the `preversion`/`postversion` npm scripts push tags automatically — never run `npm version` unprompted). The publishing gate is `prepublishOnly`: lint → typecheck → test → build → `pack:check` (`npm pack --dry-run`, which also verifies that `AI_SKILL.md` ships in the package).
