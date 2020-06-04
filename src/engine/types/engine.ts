import { Guild, TextChannel, DMChannel, ClientEvents, MessageOptions, ChannelLogsQueryOptions, PresenceData, MessageEditOptions } from 'discord.js';
import { Event } from './listener';

/** interface with expected input values for each EngineCommand command */
export interface EngineCommands {
    login: [string],
    selectGuild: [string],
    selectChannel: [string],
    fetchGuild: [string],
    fetchChannel: [string],
    fetchUser: [string],
    fetchMember: [string],
    showGuilds: [string?],
    showChannels: [string?],
    showMembers: [string?],
    updatePrecense: [PresenceData],
    sendMessage: [MessageOptions],
    editMessage: [EngineEditOptions],
    deleteMessage: [string],
    deleteMessages: [ChannelLogsQueryOptions],
    readChannel: [ChannelLogsQueryOptions],
    listenClient: [EngineListenOptions],
    listenGuild: [EngineListenOptions],
    listenChannel: [EngineListenOptions]
}

/** Engine#instance inferface with current Engine variables */
export interface EngineInstance {
    discordToken: string,
    currentGuild?: Guild,
    currentChannel?: TextChannel | DMChannel
}

/** Object containing both a EngineCommands command and the required argument */
export interface EngineCall {
    command: keyof EngineCommands,
    args: any
}

/** Object containing a event handler and a array of ClientEvents to use the handler with */
export interface EngineListenOptions {
    handler(event: Event<keyof ClientEvents>): void,
    includeEvents?: Array<keyof ClientEvents>
}

/** Object containing a discord message id of the target message and the MessageEditOptions object */
export interface EngineEditOptions {
    messageID: string,
    editOptions: MessageEditOptions
}