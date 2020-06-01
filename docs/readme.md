# discord-cli language specifications

discord-cli is built on top of @discord-cli/engine and supports all functions the former mentioned does.

For the @discord-cli/engine docs see [engine.md](./engine.md).

## Scope

discord-cli is defined as a scripting language that enables a programmatic access to discord bots.

## Conformance

1. A conforming implementation of discord-cli must provide support for all functions supported by @discord-cli/engine. This includes all actions and arguments (known as values).

2. A conforming implementation of discord-cli must support all the data types specificed and returned by @dicord-cli/engine.

3. A conforming implementation of discord-cli must compile down into javascript executable code that can interract with @discord-cli/engine.

A conforming implementation of discord-cli can in principle use any syntax as long as the above clauses are fulfilled.

## Overview

discord-cli is an scripting language capable of accessing and manipulating [discord](https://discordapp.com) bots using their [api](https://discord.com/developers/docs/legal). This is made possible using the [discord.js](https://discord.js.org) library, a discord api SDK for javascript. discord-cli was designed to be a tool capable of using and moving discord bots dynamically, either via a terminal or other applications designed for interactive use.

discord-cli was **NOT** designed to replace discord.js nor designed to being able to create standalone discord bots, though it's possible to use discord-cli for data scraping or other mass use of the discord-api, limited only by discords terms of service.

Even though it's designed to be a scripting language the engine was made with extensibility in mind, so using @discord-cli/engine for other clients, such as possibly a discord bot client.

## Syntax

Since the actual syntax isn't part of the discord-cli language specification you can find it under [syntax.md](./syntax.md) instead.
For an in-depth of @discord-cli/engine you can see [engine.md](./engine.md).

## Data formats

A conforming implementation of discord-cli must interpret source text input in conformance with the Unicode Standard to uphold discord functions that includes but is not limited to, messages, emojis and reactions.

## File extensions

Though in essence this is not too important, upholding some standards is the best way forward.

discord-cli script files use `dq` as extensions, this can be extended by adding any character infront or by changing the s (for script) to l (for lang). `dq` stands for `discord query` and it reflects the query like behavior of discord-cli.

## Discord Bot Tokens and instance variables

@discord-cli/engine relies on a discord bot token (a discord bot account) to function, it's possible to have more than one Engine instance, it's even possible to have more than one of the same bot instance, but each instance can only hold one bot account and hold 1 instance each.

The instance variables referes to the `Engine.instance` object which contains `instance.currentGuild?: Guild` and `instance.currentChannel?: TextChannel | DMChannel`, which are the instance variables which are used to determin context in calls to the discord api.

These variables are required by some actions of the engine, such as `sendMessage`, which requires `instance.currentChannel` to be set which in turn requires `instance.currentGuild` to also be set.

