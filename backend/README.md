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

## Notifications

Notifications can be sent via Desktop, Email, Slack, and Telegram channels.

Notification Channels are simple functions that take a string message and return a result promise. Middleware are used to wrap channels and add additional functionality, such as job queues and filtering.

## Folder Structure

```bash
.
├── README.md               # you are here
├── package.json            # node config
├── src
│   ├── bakerMonitor.ts     # Monitor for baking / endorsing events
│   ├── config.ts           # Module responsible for reading/writing system and user config for other modules
│   ├── index.ts            # Application entry point
│   ├── nodeMonitor.ts      # Monitor for node events
│   ├── notifierMiddleware  # Middleware functions to alter the behaviour of notification channels
│   └── types.ts            # Shared types used by multiple modules
└── yarn.lock               # lockfile for node dependencies. Do not modify directly
```
