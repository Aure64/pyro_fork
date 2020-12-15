# Backend Overview

Backend runs the Kiln monitor and serves the API for the frontend.


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
