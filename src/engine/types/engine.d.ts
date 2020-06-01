import { Guild, TextChannel, DMChannel, ClientEvents, MessageOptions, MessageEditOptions, ChannelLogsQueryOptions } from "discord.js";
import { Event } from "./types/listener";


interface EngineCommands {
    fetchGuild: [string],
    fetchChannel: [string],
    showGuilds: [string?],
    showChannels: [string?],
    sendMessage: [MessageOptions],
    editMessage: [string, MessageEditOptions],
    deleteMessage: [string],
    deleteMessages: [ChannelLogsQueryOptions],
    readChannel: [ChannelLogsQueryOptions],
    listenClient: [ListenOptions],
    listenGuild: [ListenOptions],
    listenChannel: [ListenOptions]
}

interface EngineInstance {
    discordToken: string,
    currentGuild?: Guild,
    currentChannel?: TextChannel | DMChannel
}

interface EngineCall {
    command: keyof EngineCommands,
    values: any
}

interface ListenOptions {
    handler(event: Event): void,
    includeEvents?: Array<keyof ClientEvents>
}