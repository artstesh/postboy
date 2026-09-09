# Postboy documentation

In-repo documentation for `@artstesh/postboy`: what changed between releases and how
to upgrade across the breaking ones. The full library documentation — concepts,
cookbook, API reference — lives on the site: <https://postboy.artstesh.ru>.

## Migration guides

Breaking lines and what to do when crossing them:

- [Migrating from 3.3 to 3.4](migration/3-3-to-3-4.md) — packaging modernization;
  no API changes, a few things to check in custom build setups.
- [Migrating from 3.4 to 3.5](migration/3-4-to-3-5.md) — the breaking one: staged
  middleware, infrastructure messages instead of direct service mutations,
  `CancelError` instead of throw-to-block.

## Release notes

One file per line, updated when a version is published:

- [3.3.0](releases/3.3.0.md) — message-driven bus mutations (`ConnectMessage`,
  `LockMessage`, `AddMiddleware`, …); direct mutation methods deprecated.
- [3.4.x](releases/3.4.x.md) — tooling, packaging, and build modernization.
- [3.5.x](releases/3.5.x.md) — middleware pipeline overhaul, staged hooks,
  structured cancellation; direct mutation methods removed.

New release notes are added to `releases/` as part of the release commit
(`3.5.4.md`, …). The 1.x legacy line (`v1-latest` on npm) is covered by the
[Versions article](https://postboy.artstesh.ru/versions.html) on the site.
