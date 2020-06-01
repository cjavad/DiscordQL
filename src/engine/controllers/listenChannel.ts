import { Client, ClientEvents, Channel } from "discord.js";
import { eventListener } from "./listenBase";
import { Event } from "../@types/listener";
import { EngineListenOptions } from "../@types/engine";

export default function channelListener (client: Client, channel: Channel, options: EngineListenOptions) {
    eventListener (client, (event: Event<keyof ClientEvents>) => {
        if (event.ids.channelID === channel.id) {
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