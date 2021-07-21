# Overview

Pyrometer is a tool for monitoring events on
[Tezos](https://tezos.com/) networks.

## Design/Architechture

- [Monitoring](./doc/monitoring.md)

## Child Projects

- [backend](/backend/README.md): monitor and API server

## Getting Started

### Docker

Start Pyrometer from Docker with arguments:

```bash
docker login registry.gitlab.com/tezos-kiln/pyrometer -u <username> -p <token>
docker run registry.gitlab.com/tezos-kiln/pyrometer:main --baker tz1Z1tMai15JWUWeN2PKL9faXXVPMuWamzJj
```

Starting Pyrometer with no arguments will fail, as it needs either
bakers or nodes to monitor. Use `--help` to see all the available
options.

If your setup is more complex (e.g. email notifier, custom
notifications, lots of bakers), it's easier to just mount your config
from your local filesystem.

```bash
docker run -v /absolute/path/to/your/config/folder:/home/node/.config/pyrometer-nodejs registry.gitlab.com/tezos-kiln/pyrometer
```

Note: the Docker image will only notify you of events via the console
output.  See [Notification Channels](#notification-channels) for other
options.

### Using Node

This method requires [Node](https://nodejs.org/en/) and
[Yarn](https://yarnpkg.com/).

⚠️ While this repository is private, you'll need to authenticate to the
registry before connecting. Follow [Gitlab's
Instructions](https://docs.gitlab.com/ee/user/packages/npm_registry/index.html#authenticate-to-the-package-registry)
before trying the following commands.

```bash
npm config set @tezos-kiln:registry https://gitlab.com/api/v4/packages/npm/
yarn global add @tezos-kiln/pyrometer
npx pyrometer
```

Like the Docker setup, Pyrometer will fail unless you provide either
bakers or nodes to monitor.  Use `--help` to see all the available
options.

Pyrometer will automatically notify you of any events via desktop
notifications.  See [Notification Channels](#notification-channels)
for other options.

## Docker Build

To build the Docker image from scratch, clone this repo and run:

```bash
docker build -t tezos-kiln/Pyrometer .
```

### Notification Channels

Run Pyrometer with `--help` to see the CLI and config key names for
the channel settings.

#### Desktop

This channel is enabled by default, but won't work for Docker setups.

#### Telegram

1. Send `/newbot` to the Telegram BotFather bot and follow the
   instructions to create a bot that Pyrometer will use to send
   notifications. If you've already made a bot, skip to the next
   step. [Start BotFather
   Conversation](https://telegram.me/BotFather).
1. After creating your bot, copy the "HTTP API Token" from the
   BotFather and provide it to Pyrometer either via the CLI or the
   user config file.
1. Click the link to your bot that the BotFather gives you and send
   `/start` to your bot.
1. Start Pyrometer within 24 hours of starting your bot to load the
   `chatId` and complete your setup. If you attempt to complete this
   after 24 hours and the chatId cannot be found, simply send another
   message to your bot and try again.

#### Email

The email notification channel uses SMTP settings that you provide to
send your notifications to an email address. See Pyrometer's help for
the settings. We recommend using
[MailCatcher](https://mailcatcher.me/) to try this out locally while
you're fine-tuning the volume of events you want to receive.

#### Slack

This channel will post your notifications to a Slack webhook. Follow
[the instructions here](https://api.slack.com/messaging/webhooks) to
configure your webhook, and provide the URL to Pyrometer.

#### Endpoint

This channel will post the raw JSON of an event to a webhook.  We
recommend this for creating custom apps and visualizations using
Pyrometer's data.
