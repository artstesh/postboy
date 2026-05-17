## Version 3.4.0 — tooling, packaging, and build modernization

This release focuses on improving the project toolchain, publishing pipeline, and package output format. There are no intended runtime behavior changes in the message bus API, but the package is now prepared with a more modern build and validation setup.

### What changed

#### ESLint replaces TSLint

The project has moved from the deprecated TSLint toolchain to ESLint for TypeScript linting.

This improves long-term maintainability and aligns the project with the current TypeScript ecosystem. Linting is now based on the TypeScript ESLint tooling and is integrated into the release checks.

#### Modernized build pipeline

The build process now uses a bundler-based setup instead of relying only on direct TypeScript compilation.

The package is built into:

- ESM output;
- CommonJS output;
- TypeScript declaration files;
- source maps.

This makes the package easier to consume from both modern ESM projects and CommonJS-based environments.

#### Updated package exports

The package entry point now explicitly exposes separate ESM and CommonJS builds.

This improves compatibility with different Node.js and bundler configurations and makes module resolution more predictable for consumers.

#### Improved release validation

The release and publishing scripts now perform a stricter validation sequence before publishing.

The release pipeline includes:

- linting;
- type checking;
- tests;
- production build;
- package dry-run validation.

This reduces the chance of publishing an incomplete or incorrectly packaged release.

#### Type checking as a dedicated step

A separate type-checking script was added.

This allows TypeScript correctness to be verified independently from building the package, which is useful for CI pipelines and local development workflows.

#### Cleaner package output

The cleanup process was improved to reliably remove generated build artifacts before packaging.

This helps ensure that published packages are built from a clean state and do not accidentally include stale generated files.

#### Formatting configuration refined

Prettier settings were expanded to make formatting behavior more explicit and consistent across environments.

The formatting rules now define indentation, semicolon usage, quote style, trailing commas, line width, and line endings.

#### TypeScript configuration updated

The TypeScript configuration was adjusted for a more modern JavaScript target.

The project now targets ES2020 and separates production compilation from test-oriented type configuration more clearly.

#### Test configuration simplified

The test configuration was streamlined to use a clearer test matching strategy and a dedicated TypeScript test configuration.

This makes test execution more predictable and easier to maintain.

### Dependency updates

Development dependencies were updated to support the new linting, formatting, build, cleanup, and packaging workflow.

Notable tooling additions include:

- ESLint;
- TypeScript ESLint packages;
- Prettier integration for ESLint;
- tsup;
- rimraf;
- jiti.

### Migration notes

No application-level migration is expected for users of the public message bus API.

If you consume the package in a custom build setup, make sure your environment correctly resolves the package exports:

```json
{
  "import": "./lib/index.mjs",
  "require": "./lib/index.cjs",
  "types": "./lib/index.d.ts"
}
```

For maintainers, the recommended validation flow is now:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run pack:check
```

### Why this change

The goal of this release is to make the project easier to maintain, safer to publish, and more compatible with modern JavaScript tooling. By replacing deprecated tools, producing both ESM and CommonJS builds, and strengthening release checks, version x.4.0 provides a more reliable foundation for future feature development.
