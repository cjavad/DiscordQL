import { Client, ClientEvents } from 'discord.js';
import { eventListener } from './listenBase';
import { Event } from '../types/listener';
import { EngineListenOptions } from '../types/engine';

/**
 * Handles all events, along side with the options.
 * @param client - Discord client instance
 * @param options - Event handler and includeEvents[] for the listener
 */
export default function listenClient (client: Client, options: EngineListenOptions): void {
    eventListener(client, (event: Event<keyof ClientEvents>) => {
        if (options.includeEvents) {
            if (options.includeEvents.includes(event.name)) {
                return options.handler(event);
            }
        } else {
            return options.handler(event);
        }
    });
}