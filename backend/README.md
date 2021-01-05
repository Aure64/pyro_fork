# Backend Overview

Backend runs the Kiln monitor and serves the API for the frontend.

## Installation

### Via Git

```
# HTTPS
git clone https://gitlab.com/tezos-kiln/kiln-next.git
# or via SSH
git@gitlab.com:tezos-kiln/kiln-next.git
```

### Via NPM / Yarn

```
npm config set @tezos-kiln:registry https://gitlab.com/api/v4/packages/npm/
yarn add @tezos-kiln/backend
```

While this repository is private, you'll need to authenticate before connecting. Follow [Gitlab's Instructions](https://docs.gitlab.com/ee/user/packages/npm_registry/index.html#authenticate-to-the-package-registry) for authenticating.

## Scripts

### `yarn dev`

Starts the backend up in development mode.

### `yarn test`

Tests the codebase.

### `yarn prettier:lint`

Check the format of the code using Prettier.

### `yarn prettier:fix`

Fix any format mistakes in the code using Prettier.

### `yarn tsc:lint`

Lint TypeScript.

### `yarn build`

Compile backend from TypeScript to JavaScript in `dist/` directory.

### `yarn eslint:lint`

Check the format of the code using ESLint.

### `yarn eslint:fix`

Attempt to fix any format mistakes in the code using ESLint. Not all mistakes can be fixed automatically by this script.

### `yarn lint`

Lint the code using all linting scripts (scripts ending in `:lint`).

## Design decisions

- prefer async/await over promise
```typescript
// do this:
const result = await fetch();
// handle result

// not this:
fetch().then(result => {
  // handle result
});
```
- use [await-to-js](https://github.com/scopsy/await-to-js) instead of try/catch.  Try/catch can lead to catching more greedily than intended, making debugging difficult.
```typescript
// do this:
const [error, result] = await to(asyncFunctionThatCanFail());
if (error) {
  // handle error
} else {
  // handle success
}

// not this:
try {
  const result = await asyncFunctionThatCanFail();
  // handle success
} catch(error) {
  // handle error
}
```

## Folder Structure

```bash
.
├── README.md               # you are here
├── package.json            # node config
├── src
│   ├── index.ts            # Application entry point
│   └── types.ts            # Shared types used by multiple modules
└── yarn.lock               # lockfile for node dependencies. Do not modify directly.
```
