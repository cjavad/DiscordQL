import { Client, Guild, ClientEvents } from 'discord.js';
import { eventListener } from './listenBase';
import { Event } from '../../types/listener';
import { EngineListenOptions } from '../../types/engine';

/**
 * Handles all events from the specified guild, along side with the options.
 * @param client - Discord client instance
 * @param guild  - Discord guild to listen for events in that client exists in
 * @param options - Event handler and includeEvents[] for the listener
 */
export default function listenGuild (client: Client, guild: Guild, options: EngineListenOptions): void {
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