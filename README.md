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

### From Source

See the [backend README](backend/README.md) for instructions on running Kiln from source using Yarn and NPM.

## Docker Build

To build the Docker image from scratch, clone this repo and run:
```bash
docker build -t tezos-kiln/kiln-next .
```
