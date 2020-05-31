import { Client, Guild, ClientEvents } from "discord.js";
import { eventListener, event } from "./listenBase";

export default function guildListener (client: Client, guild: Guild, callback: (event: event) => void, includeEvents?: Array<keyof ClientEvents>) {
    eventListener(client, (event: event) => {
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