# discord-cli

You ever wanted to browse your discord server from a terminal? Look no further discord-cli aims to be a CLI interface with your discord bot.

## Engine

Currently the discord engine uses the following system to execute and interact with discord.

```ts
import Engine from "./engine";
import { event } from "./engine/listenBase";

const engine = new Engine('discord token');

(async () => {
    await engine.executeCall('fetchGuild', 'guild id');
    await engine.executeCall('fetchChannel', 'channel id');

    await engine.executeCall('listenChannel', {
        handler: (event: event) => {
            console.log(event.eventName);
        }
    });
})();

```
