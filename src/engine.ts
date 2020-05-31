import { Client,  TextChannel, DMChannel, MessageOptions, MessageEditOptions, ChannelLogsQueryOptions,  Guild, ClientEvents, Message, Collection } from "discord.js";
import sendMessage from "./engine/sendMessage";
import deleteMessage from "./engine/deleteMessage";
import editMessage from "./engine/editMessage";
import fetchGuild from "./engine/fetchGuild";
import fetchChannel from "./engine/fetchChannel";
import showGuilds from "./engine/showGuilds";
import showChannels from "./engine/showChannels";
import readChannel from "./engine/readChannel";
import listenClient from "./engine/listenClient";
import listenGuild from "./engine/listenGuild";
import listenChannel from "./engine/listenChannel";
import { event } from "./engine/listenBase";

interface EngineCommands {
    fetchGuild: [string],
    fetchChannel: [string],
    showGuilds: [string?],
    showChannels: [string?],
    sendMessage: [MessageOptions],
    editMessage: [string, MessageEditOptions],
    deleteMessage: [string],
    readChannel: [ChannelLogsQueryOptions],
    listenClient: [ListenCall],
    listenGuild: [ListenCall],
    listenChannel: [ListenCall]
}

interface EngineInstance {
    discordToken: string,
    currentGuild?: Guild,
    currentChannel?: TextChannel | DMChannel
}


interface ListenCall {
    handler(event: event): void,
    includeEvents?: Array<keyof ClientEvents>
}

class Instance implements EngineInstance {
    constructor (public discordToken: string, public currentGuild?: Guild, public currentChannel?: TextChannel | DMChannel) {
        
    }
}

class EngineError extends Error {
    command: string;

    constructor (command: string, ...params: any) {
        super(...params);
        Error.captureStackTrace(this, EngineError);
        this.name = 'EngineError';
        this.command = command;
    }
}

export default class Engine {
    client: Client;
    discordToken: string;
    instance: EngineInstance;

    constructor (discordToken: string) {
        this.client = new Client();
        this.discordToken = discordToken;
        this.instance = new Instance(discordToken);
    }

    async executeCall<K extends keyof EngineCommands> (command: K, ...values: EngineCommands[K] ): Promise<any> {
        let client: Client;

        if (this.client.token) {
            client = this.client;
        } else {
            await this.client.login(this.discordToken);
            client = this.client;
        }

        return new Promise(async (resolve, reject) => {
            if (command === 'fetchGuild') {
                if (!client) return reject(new EngineError(command));
                if (!/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                var guildID = values[0] as string;
                this.instance.currentGuild = await fetchGuild(client, guildID);
                return resolve(this.instance.currentGuild);
            } else if (command === 'fetchChannel') {
                if (!client) return reject(new EngineError(command));
                if (!/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                var channelID = values[0] as string;
                this.instance.currentChannel = await fetchChannel(client, channelID);
                return resolve(this.instance.currentChannel);
            } else if (command === 'showGuilds') {
                if (!client) return reject(new EngineError(command));
                let search = undefined;
                if (typeof values[0] === 'string') search = values[0];
                var guilds = await showGuilds(client, search);
                return resolve(guilds);
            } else if (command === 'showChannels') {
                if (!this.instance.currentGuild) return reject(new EngineError(command));
                let search = undefined;
                if (typeof values[0] === 'string') search = values[0];
                var channels = await showChannels(this.instance.currentGuild, search);
                return resolve(channels);
            } else if (command === 'sendMessage') {
                if (!this.instance.currentChannel) return reject(new EngineError(command));
                if (typeof values !== 'object') return reject(new EngineError(command));
                let options: MessageOptions = values as MessageOptions;
                var message = await sendMessage(this.instance.currentChannel, options);
                return resolve(message);
            } else if (command === 'editMessage') {
                if (!this.instance.currentChannel) return reject(new EngineError(command));
                if (!/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                if (typeof values[1] !== 'object') return reject(new EngineError(command));
                var messageID = values[0] as string;
                let options: MessageEditOptions = values[1] as MessageEditOptions;
                var message = await editMessage(this.instance.currentChannel, messageID, options);
                return resolve(message);
            } else if (command === 'deleteMessage') {
                if (!this.instance.currentChannel) return reject(new EngineError(command));
                if (!/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                var messageID = values[0] as string;
                var message = await deleteMessage(this.instance.currentChannel, messageID);
                return resolve(message);
            } else if (command === 'readChannel') {
                if (!this.instance.currentChannel) return reject(new EngineError(command));
                if (typeof values !== 'object') return reject(new EngineError(command));
                let options: ChannelLogsQueryOptions = values as ChannelLogsQueryOptions;
                var messages = await readChannel(this.instance.currentChannel, options);
                return resolve(messages);
            } else if (command === 'listenClient') {
                if (!client || !values) return reject(new EngineError(command));
                var options: ListenCall = values[0] as unknown as ListenCall;
                return resolve(listenClient(client, options.handler, options.includeEvents));

            } else if (command === 'listenGuild') {
                if (!client || !this.instance.currentGuild || !values) return reject(new EngineError(command));
                var options: ListenCall = values[0] as unknown as ListenCall;
                return resolve(listenGuild(client, this.instance.currentGuild, options.handler, options.includeEvents));

            } else if (command === 'listenChannel') {
                if (!client || !this.instance.currentChannel || !values) return reject(new EngineError(command));
                var options: ListenCall = values[0] as unknown as ListenCall;
                return resolve(listenChannel(client, this.instance.currentChannel, options.handler, options.includeEvents));
            }
        });
    }
}