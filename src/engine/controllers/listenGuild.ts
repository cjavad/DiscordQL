import { Client, Guild, ClientEvents } from "discord.js";
import { eventListener } from "./listenBase";
import { Event } from "../types/listener";

export default function guildListener (client: Client, guild: Guild, callback: (event: Event) => void, includeEvents?: Array<keyof ClientEvents>) {
    eventListener(client, (event: Event) => {
        if (event.ids.guildID === guild.id) {
            if (includeEvents) {
                if (includeEvents.includes(event.eventName)) {
                    return callback(event);
                }
            } else {
                return callback(event);
            }
        }
    });
}