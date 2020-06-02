import { ClientEvents } from 'discord.js';

/** Object containing discord context for a event, that being optionally a guild or channel id */
export interface Ids {
    channelID?: string,
    guildID?: string
}

/** Event object containing the name of the ClientEvent, its return params and a its discord id context */
export interface Event<K extends keyof ClientEvents> {
    name: K,
    params: ClientEvents[K],
    ids: Ids
}