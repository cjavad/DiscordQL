import { Client,  TextChannel, DMChannel, MessageOptions, MessageEditOptions, ChannelLogsQueryOptions,  Guild, ClientEvents, Message, Collection } from "discord.js";
import { EngineInstance, EngineCommands, EngineCall, ListenOptions } from "./types/engine";
import sendMessage from "./controllers/sendMessage";
import deleteMessage from "./controllers/deleteMessage";
import deleteMessages from "./controllers/deleteMessages";
import editMessage from "./controllers/editMessage";
import fetchGuild from "./controllers/fetchGuild";
import fetchChannel from "./controllers/fetchChannel";
import showGuilds from "./controllers/showGuilds";
import showChannels from "./controllers/showChannels";
import readChannel from "./controllers/readChannel";
import listenClient from "./controllers/listenClient";
import listenGuild from "./controllers/listenGuild";
import listenChannel from "./controllers/listenChannel";

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
    stack: Array<EngineCall> = [];

    constructor (discordToken: string) {
        this.client = new Client();
        this.discordToken = discordToken;
        this.instance = new Instance(discordToken);
    }

    pushStack<K extends keyof EngineCommands> (command: K, ...values: EngineCommands[K]) {
        this.stack.push({
            command: command,
            values: values
        });
    }

    async executeStack (callback: (command: keyof EngineCommands, value: any) => void) {
        for (let i = 0; i < this.stack.length; i++) {
            var value = await this.executeCall(this.stack[i].command, ...this.stack[i].values);
            callback(this.stack[i].command, value);
            this.stack = this.stack.filter((_item, index) => index === i);
        }
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
            let guildID: string;
            let channelID: string;
            let messageID: string;
            let search: string | undefined;
            let options: MessageOptions | MessageEditOptions | ChannelLogsQueryOptions | ListenOptions;

            switch (command) {
                case 'fetchGuild':
                    if (!client || !/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                    guildID = values[0] as string;
                    this.instance.currentGuild = await fetchGuild(client, guildID);
                    return resolve(this.instance.currentGuild);
            
                case 'fetchChannel':
                    if (!client || !/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                    channelID = values[0] as string;
                    this.instance.currentChannel = await fetchChannel(client, channelID);
                    return resolve(this.instance.currentChannel);

                case 'showGuilds':
                    if (!client) return reject(new EngineError(command));
                    if (typeof values[0] === 'string') search = values[0];
                    var guilds = await showGuilds(client, search);
                    return resolve(guilds);
                
                case 'showChannels':
                    if (!this.instance.currentGuild) return reject(new EngineError(command));
                    if (typeof values[0] === 'string') search = values[0];
                    var channels = await showChannels(this.instance.currentGuild, search);
                    return resolve(channels);

                case 'sendMessage':
                    if (!this.instance.currentChannel) return reject(new EngineError(command));
                    if (typeof values !== 'object') return reject(new EngineError(command));
                    options = values as MessageOptions;
                    var message = await sendMessage(this.instance.currentChannel, options);
                    return resolve(message);

                case 'editMessage':
                    if (!this.instance.currentChannel || !/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                    messageID = values[0] as string;
                    options = values[1] as MessageEditOptions;
                    var message = await editMessage(this.instance.currentChannel, messageID, options);
                    return resolve(message);

                case 'deleteMessage':
                    if (!this.instance.currentChannel || !/\d{18}/.test(values[0] as string)) return reject(new EngineError(command));
                    messageID = values[0] as string;
                    var message = await deleteMessage(this.instance.currentChannel, messageID);
                    return resolve(message);
                
                case 'deleteMessages':
                    if (!this.instance.currentChannel) return reject(new EngineError(command));
                    options = values[0] as ChannelLogsQueryOptions;
                    var deletedMessages = await deleteMessages(this.instance.currentChannel as TextChannel, options);
                    return resolve(deletedMessages.array());


                case 'readChannel':
                    if (!this.instance.currentChannel) return reject(new EngineError(command));
                    options = values[0] as ChannelLogsQueryOptions;
                    var messages = await readChannel(this.instance.currentChannel, options);
                    return resolve(messages.array());

                case 'listenClient':
                    if (!client) return reject(new EngineError(command));
                    options = values[0] as unknown as ListenOptions;
                    return resolve(listenClient(client, options.handler, options.includeEvents));

                case 'listenGuild':
                    if (!client || !this.instance.currentGuild || !values) return reject(new EngineError(command));
                    options = values[0] as unknown as ListenOptions;
                    return resolve(listenGuild(client, this.instance.currentGuild, options.handler, options.includeEvents));

                case 'listenChannel':
                    if (!client || !this.instance.currentChannel || !values) return reject(new EngineError(command));
                    options = values[0] as unknown as ListenOptions;
                    return resolve(listenChannel(client, this.instance.currentChannel, options.handler, options.includeEvents));
                default:
                    break;
            }
        });
    }
}