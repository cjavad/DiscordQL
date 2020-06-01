import { Client, ClientEvents, Channel } from "discord.js";
import { eventListener } from "./listenBase";
import { Event } from "../types/listener";

export default function channelListener (client: Client, channel: Channel, callback: (event: Event) => void, includeEvents?: Array<keyof ClientEvents>) {
    eventListener(client, (event: Event) => {
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