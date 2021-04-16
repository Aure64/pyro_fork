# Overview

Kiln is a tool for both baking and monitoring on the [Tezos](https://tezos.com/) network. This repository is a complete rewrite of Kiln. During the rewrite we recommend using the classic [Kiln](https://gitlab.com/tezos-kiln/kiln/).

## Design/Architechture

- [Monitoring](./doc/monitoring.md)

## Child Projects

- [backend](/backend/README.md):  monitor and API server

## Getting Started

### Docker

Start Kiln from Docker with arguments:

```bash 
docker login registry.gitlab.com/tezos-kiln/kiln-next -u <username> -p <token>
docker run registry.gitlab.com/tezos-kiln/kiln-next:main --baker tz1Z1tMai15JWUWeN2PKL9faXXVPMuWamzJj
```

Starting Kiln with no arguments will fail, as it needs either bakers or nodes to monitor. Use `--help` to see all the available options.

If your setup is more complex (e.g. email notifier, custom notifications, lots of bakers), it's easier to just mount your config from your local filesystem.

```bash 
docker run -v /absolute/path/to/your/config/folder:/home/node/.config/kiln-next-nodejs registry.gitlab.com/tezos-kiln/kiln-next
```

### Using Node

This method requires [Node](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/).

⚠️  While this repository is private, you'll need to authenticate to the registry before connecting. Follow [Gitlab's Instructions](https://docs.gitlab.com/ee/user/packages/npm_registry/index.html#authenticate-to-the-package-registry) before trying the below commands.

```bash
npm config set @tezos-kiln:registry https://gitlab.com/api/v4/packages/npm/
yarn global add @tezos-kiln/kiln-next
npx kiln-next
```

## Docker Build

To build the Docker image from scratch, clone this repo and run:

```bash
docker build -t tezos-kiln/kiln-next .
```
