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

Starts the server up in development mode.

### `yarn test`

Tests the codebase.

### `yarn prettier:lint`

Check the format of the code using Prettier.

### `yarn prettier:fix`

Fix any format mistakes in the code using Prettier.

### `yarn tsc:lint`

Lint TypeScript.

### `yarn build`

Compile server from TypeScript to JavaScript in `dist/` directory.

### `yarn eslint:lint`

Check the format of the code using ESLint.

### `yarn eslint:fix`

Attempt to fix any format mistakes in the code using ESLint. Not all mistakes can be fixed automatically by this script.

### `yarn lint`

Lint the code using all linting scripts (scripts ending in `:lint`).

## Folder Structure

```bash
.
├── README.md       # you are here
├── package.json    # node project config
├── src             # code root
│   └── server.js   # application entry point
└── yarn.lock       # lockfile for node dependencies. Do not modify directly.
```
