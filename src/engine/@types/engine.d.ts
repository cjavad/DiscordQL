import { Guild, TextChannel, DMChannel, ClientEvents, MessageOptions, MessageEngineEditOptions, ChannelLogsQueryOptions, PresenceData } from "discord.js";
import { Event } from "./listener";

export interface EngineCommands {
    selectGuild: [string],
    selectChannel: [string],
    fetchGuild: [string],
    fetchChannel: [string],
    fetchUser: [string],
    fetchMember: [string],
    showGuilds: [string?],
    showChannels: [string?],
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

export interface EngineInstance {
    discordToken: string,
    currentGuild?: Guild,
    currentChannel?: TextChannel | DMChannel
}

export interface EngineCall {
    command: keyof EngineCommands,
    args: any
}

export interface EngineListenOptions {
    handler(event: Event<keyof ClientEvents>): void,
    includeEvents?: Array<keyof ClientEvents>
}

export interface EngineEditOptions {
    messageID: string,
    EngineEditOptions: MessageEngineEditOptions
}