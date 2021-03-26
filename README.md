# Overview

Kiln is a tool for both baking and monitoring on the
[Tezos](https://tezos.com/) network. This repository is a complete
rewrite of Kiln. During the rewrite we recommend using the classic
[Kiln](https://gitlab.com/tezos-kiln/kiln/).

## Design/Architechture

- [Monitoring](./doc/monitoring.md)

## Child Projects

- [backend](/backend/README.md):  monitor and API server

## Docker

Build the Docker image from scratch.
```bash
docker build -t tezos-kiln/kiln-next .
```

Start the Docker image with arguments.
```bash 
docker run tezos-kiln/kiln-next --baker tz1Z1tMai15JWUWeN2PKL9faXXVPMuWamzJj
```

If your config is more complex (e.g. email notifier config, lots of bakers), it's easier to just mount your config from your local filesystem.  This allows easily upgrading Kiln docker images while persisting your data.
```bash 
docker run -v /absolute/path/to/your/config/folder:/home/node/.config/kiln-next-nodejs tezos-kiln/kiln-next
```
