# Overview

Pyrometer is a tool for monitoring events on
[Tezos](https://tezos.com/) networks.

## Design/Architechture

- [Monitoring](./doc/monitoring.md)

## Child Projects

- [backend](/backend/README.md): monitor and API server

## Run on Ubuntu/Debian

- Install NodeJS 14 or later following instructions at
  <https://github.com/nodesource/distributions>.

- Download latest .deb from
  <https://gitlab.com/tezos-kiln/pyrometer/-/releases>

- Install:

```
sudo dpkg -i pyrometer_0.1.0_all.deb
```

- Edit config file at `/etc/pyrometer.toml` to specify bakers and
  nodes to monitor, as well as configure notification channels

- Restart pyrometer service:

```
sudo systemctl restart pyrometer
```

- Check log output, e.g.:

```
journalctl -u pyrometer -f
```

## Run with Docker

Log in to Gitlab Docker Registry:

```
docker login registry.gitlab.com/tezos-kiln/pyrometer -u <username> -p <token>
```

Lets define shell alias so that following example commands are concise
and clear:

```
docker network create pyrometer
alias pyrometer="docker run --network pyrometer --rm -v $PWD:$PWD registry.gitlab.com/tezos-kiln/pyrometer"
```

Lets also create a directory for pyrometer configuration and data:

```
mkdir -p ./pyrometer/data
cd pyrometer
```

Generate sample Pyrometer configuration and save it as `pyrometer.toml`:

```
pyrometer config sample > pyrometer.toml
```

> ℹ️ Pyrometer configuration file uses [TOML](https://toml.io) syntax

Edit `pyrometer.toml` as necessary.

For example, lets say we would like to monitor some of the Foundation
Bakers and receive email notifications for all the events except
future bakes and endorsements.

For illustration purposes we will use
[MailHog](https://github.com/mailhog/MailHog) as our SMTP
server. Start MailHog:

```
docker run --rm --name mailhog --network pyrometer -d -p 8025:8025 mailhog/mailhog
```

WebHog's web interface should now be available at <http://localhost:8025/>

Edit `pyrometer.toml` to look like this:

```toml

exclude = [
  "baked",
  "endorsed",
]

[baker_monitor]
bakers = ["tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9", "tz3bvNMQ95vfAYtG8193ymshqjSvmxiCUuR5"]
max_catchup_blocks = 120
rpc = "https://mainnet-tezos.giganode.io/"

[log]
level = "debug"

[email]
enabled = true
host = "mailhog"
port = 1025
username = "aaa"
password = "bbb"
to = [ "me@example.org" ]
emoji = true
short_address = true

```

> MailHog accepts any username and password, they just need to be not empty

Now start Pyrometer:

```bash
pyrometer run -c $PWD/pyrometer.toml -d $PWD/data
```

All configuration parameters can be specified or overriden from the
command line. Run `pyrometer --help` to see available commands and
global options, `pyrometer <command> --help` to see command-specific
parameters.

### Run Natively

Install NodeJS 14 or later. For Linux, follow instructions at
<https://github.com/nodesource/distributions>. For other operating
systems, download from <https://nodejs.org>.

⚠️ While this repository is private, you'll need to authenticate to the
registry before connecting.

```
GITLAB_API_TOKEN="<your token>"
PROJECT_ID=22897259
npm config set @tezos-kiln:registry https://gitlab.com/api/v4/projects/$PROJECT_ID/packages/npm/
npm config set -- '//gitlab.com/api/v4/projects/$PROJECT_ID/packages/npm/:_authToken' $GITLAB_API_TOKEN

```

See [Gitlab's
Instructions](https://docs.gitlab.com/ee/user/packages/npm_registry/index.html#authenticate-to-the-package-registry)
for details.

Assuming we have `./pyrometer.toml` config file and `./data`
directory, start Pyrometer:

```bash
npx @tezos-kiln/pyrometer run -c $PWD/pyrometer.toml -d $PWD/data
```

## Docker Build

To build the Docker image from scratch, clone this repo and run:

```bash
docker build -t tezos-kiln/Pyrometer .
```

### Notification Channels

Run Pyrometer with `pyrometer run --help` to see the CLI and config
key names for the channel settings.

#### Desktop

Shows desktop notifications (not available when running in Docker)

#### Telegram

Sends notifications via Telegram. To enable:

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

![](doc/telegram-screenshot.png)

#### Email

The email notification channel uses SMTP settings that you provide to
send your notifications to an email address. See Pyrometer's help for
the settings. We recommend using
[MailCatcher](https://mailcatcher.me/) or
[MailHog](https://github.com/mailhog/MailHog) to try this out locally while
you're fine-tuning the volume of events you want to receive.

#### Slack

This channel will post your notifications to a Slack webhook. Follow
[the instructions here](https://api.slack.com/messaging/webhooks) to
configure your webhook, and provide the URL to Pyrometer.

![](doc/slack-screenshot.png)

#### Webhook

This channel will post the raw JSON of an event to a webhook.  We
recommend this for creating custom apps and visualizations using
Pyrometer's data.
