import { ClientEvents } from "discord.js";

export interface Ids {
    channelID?: string,
    guildID?: string
}


export interface Event {
    eventName: keyof ClientEvents,
    params: any,
    ids: Ids
}