import { Client, ClientEvents } from "discord.js";
import { eventListener, event } from "./listenBase";

export default function channelListener (client: Client, callback: (event: event) => void, includeEvents?: Array<keyof ClientEvents>) {
    eventListener(client, (event: event) => {
        if (includeEvents) {
            if (includeEvents.includes(event.eventName)) {
                return callback(event);
            }
        } else {
            return callback(event);
        }
    });
}