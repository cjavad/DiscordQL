import { Client, ClientEvents, Channel } from 'discord.js';
import { eventListener } from './listenBase';
import { Event } from '../../types/listener';
import { EngineListenOptions } from '../../types/engine';

/**
 * Handles all events from the specified channel, along side with the options.
 * @param client - Discord client instance
 * @param channel - Discord channel to listen for events in that client has access to
 * @param options - Event handler and includeEvents[] for the listener
 */
export default function listenChannel (client: Client, channel: Channel, options: EngineListenOptions): void {
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