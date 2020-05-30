# discord-cli

You ever wanted to browse your discord server from a terminal? Look no further discord-cli aims to be a CLI interface with your discord bot.

## Engine

Currently the discord engine uses the following system to execute and interact with discord.

```ts
import { Engine, Call } from "./src/engine"

const engine = new Engine('discord token');

// Add calls to stack or execute it instantly

let call;

call = new Call('showGuilds', []);

engine.executeCall(call, (command: string, callback: any) => {
    // Here callback will be a Collection<Snowflake, Guild>
    // We'll use the first guild for instance.
    var guildID = callback.array()[0];
    engine.addCall('fetchGuild', [guildID]);
    engine.addCall('fetchChannel', ['channelID']);
    engine.addCall('sendMessage', { content: 'Hello World!' });
    engine.executeStack((command: string, callback: any) => {});
});
```

TODO: Make engine calls async with Promises.
