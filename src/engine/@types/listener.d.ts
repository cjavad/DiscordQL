import { ClientEvents } from "discord.js";

export interface Ids {
    channelID?: string,
    guildID?: string
}

export interface Event<K extends keyof ClientEvents> {
    name: K,
    params: ClientEvents[K],
    ids: Ids
}