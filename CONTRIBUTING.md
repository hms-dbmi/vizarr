## Feedback and Contribution

Thanks for your interest in `vizarr`! I welcome any input, feedback, bug reports, and contributions.
Please do not hesitate to reach out if you have any questions!

### Setting up a development environment

In order to make changes to `vizarr`, you will need to fork the repository. Clone your fork
of the repository to your local machine and change directories:

```bash
git clone https://github.com/your-username/vizarr.git
cd vizarr
```

Set the `upstream` remote to the base `vizarr` repository:

```bash
git remote add upstream https://github.com/hms-dbmi/vizarr.git
```

Install the dependencies to develop and build `vizarr` via `pnpm`.

```bash
pnpm install
```

> Note: You need to have [Node.js](https://nodejs.org/en/) (v20.0 or later) to build
> and develop `vizarr`. I recommend using [`nvm`](https://github.com/nvm-sh/nvm) or
> [`fnm`](https://github.com/Schniz/fnm) to manage different version of Node.js
> on your machine.

### Development commands

```bash
pnpm dev          # start dev server at http://localhost:5173
pnpm check        # typecheck with tsc
pnpm test         # run vitest suite
pnpm lint         # lint with biome
pnpm fix          # auto-format with biome
pnpm build        # production build
```

The `dev` command will start a development server on `http://localhost:5173`
which you can navigate to in your web browser. You can "live" edit the contents
of any of the files within `src/` or `public/` when running this server;
changes are reflected instantly in the browser.

- `src/` - contains all TypeScript source code
- `public/` - contains all static assets required for the site

### Tests

Tests use [vitest](https://vitest.dev/) with [in-source testing](https://vitest.dev/guide/in-source),
so test blocks live alongside the code they exercise and are tree-shaken from production builds.

Fixture-based tests snapshot how vizarr resolves real OME-Zarr metadata into
rendering state (layer kind, channel colors, contrast limits, selections, model
matrix, etc.). The fixtures are zarr metadata only (no image bytes) crawled from
public IDR stores across spec versions (v0.1, v0.4, v0.5), stored in a single
`__tests__/fixtures.json` manifest. To regenerate or add new fixtures, edit the
`SOURCES` list in `scripts/fetch-fixtures.ts` and run:

```bash
node scripts/fetch-fixtures.ts
```

### Making changes

Create a new feature branch:

```bash
git checkout main -b your-feature-branch-name
```

Add and commit your changed files.

### Sharing your changes

Update your remote branch:

```bash
git push -u origin your-feature-branch-name
```

You can then make a pull-request to `vizarr`'s `main` branch. Please run
`pnpm fix` to automatically format your code before opening a pull-request.
CI runs typecheck, tests, lint, and build verification.
