import { Client, Guild, ClientEvents } from "discord.js";
import { eventListener } from "./listenBase";
import { Event } from "../@types/listener";
import { EngineListenOptions } from "../@types/engine";

export default function guildListener (client: Client, guild: Guild, options: EngineListenOptions) {
    eventListener(client, (event: Event<keyof ClientEvents>) => {
        if (event.ids.guildID === guild.id) {
            if (options.includeEvents) {
                if (options.includeEvents.includes(event.name)) {
                    return options.handler(event);
                }
            } else {
                return options.handler(event);
            }
        }
    });
}