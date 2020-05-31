import { Client, ClientEvents, Channel } from "discord.js";
import { eventListener, event } from "./listenBase";

export default function channelListener (client: Client, channel: Channel, callback: (event: event) => void, includeEvents?: Array<keyof ClientEvents>) {
    eventListener(client, (event: event) => {
        if (event.ids.channelID === channel.id) {
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