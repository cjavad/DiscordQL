import { Client,  TextChannel, DMChannel, MessageOptions, MessageEditOptions, ChannelLogsQueryOptions,  Guild } from "discord.js";
import sendMessage from "./engine/sendMessage";
import deleteMessage from "./engine/deleteMessage";
import editMessage from "./engine/editMessage";
import fetchGuild from "./engine/fetchGuild";
import fetchChannel from "./engine/fetchChannel";
import showGuilds from "./engine/showGuilds";
import showChannels from "./engine/showChannels";
import readChannel from "./engine/readChannel";

interface EngineCall {
    command: string,
    values: any
}

interface EngineInstance {
    discordToken: string,
    currentGuild?: Guild,
    currentChannel?: TextChannel | DMChannel
}

export class Instance implements EngineInstance {
    constructor (public discordToken: string, public currentGuild?: Guild, public currentChannel?: TextChannel | DMChannel) {
        
    }
}

export class Call implements EngineCall {
    constructor (public command: string, public values: Array<string> | MessageOptions | Array<String | MessageEditOptions> | ChannelLogsQueryOptions) {
        
    }
}

export class Engine {
    client: Client;
    discordToken: string;
    stack: Array<EngineCall> = [];
    instance: EngineInstance;

    constructor (discordToken: string) {
        this.client = new Client();
        this.discordToken = discordToken;
        this.instance = new Instance(discordToken);
    }

    addStack (engineCall: EngineCall) {
        this.stack.push(engineCall);
    }

    addCall (command: string, values: Array<string> | MessageOptions | Array<String | MessageEditOptions> | ChannelLogsQueryOptions) {
        this.addStack(new Call(command, values));
    }

    async executeStack (handler?: (command: string, callback: any) => void) {
        for (let i = 0; i < this.stack.length; i++) {
            await this.executeCall(this.stack[i], handler);
        }

        this.stack = [];
    }

    async executeCall (engineCall: EngineCall, handler?: (command: string, callback: any) => void) {
        let client: Client;

        if (this.client.token) {
            client = this.client;
        } else {
            await this.client.login(this.discordToken);
            client = this.client;
        }

        if (engineCall.command === 'fetchGuild') {
            if (!client) return;
            if (!/\d{18}/.test(engineCall.values[0])) return;
            var guildID = engineCall.values[0];
            this.instance.currentGuild = await fetchGuild(client, guildID);
            if (handler) handler(engineCall.command, this.instance.currentGuild);
        } else if (engineCall.command === 'fetchChannel') {
            if (!client) return;
            if (!/\d{18}/.test(engineCall.values[0])) return;
            var channelID = engineCall.values[0];
            this.instance.currentChannel = await fetchChannel(client, channelID);
            if (handler) handler(engineCall.command, this.instance.currentChannel);
        } else if (engineCall.command === 'showGuilds') {
            if (!client) return;
            let search = undefined;
            if (typeof engineCall.values[0] === 'string') search = engineCall.values[0];
            var guilds = await showGuilds(client, search);
            if (handler) handler(engineCall.command, guilds);
        } else if (engineCall.command === 'showChannels') {
            if (!this.instance.currentGuild) return;
            let search = undefined;
            if (typeof engineCall.values[0] === 'string') search = engineCall.values[0];
            var channels = await showChannels(this.instance.currentGuild, search);
            if (handler) handler(engineCall.command, channels);
        } else if (engineCall.command === 'sendMessage') {
            if (!this.instance.currentChannel) return;
            if (typeof engineCall.values !== 'object') return;
            let options: MessageOptions = engineCall.values;
            var message = await sendMessage(this.instance.currentChannel, options);
            if (handler) handler(engineCall.command, message);
        } else if (engineCall.command === 'editMessage') {
            if (!this.instance.currentChannel) return;
            if (!/\d{18}/.test(engineCall.values[0])) return;
            if (typeof engineCall.values[1] !== 'object') return;
            var messageID = engineCall.values[0];
            let options: MessageEditOptions = engineCall.values[1];
            var message = await editMessage(this.instance.currentChannel, messageID, options);
            if (handler) handler(engineCall.command, message);
        } else if (engineCall.command === 'deleteMessage') {
            if (!this.instance.currentChannel) return;
            if (!/\d{18}/.test(engineCall.values[0])) return;
            var messageID = engineCall.values[0];
            var message = await deleteMessage(this.instance.currentChannel, messageID);
            if (handler) handler(engineCall.command, message);
        } else if (engineCall.command === 'readChannel') {
            if (!this.instance.currentChannel) return;
            if (typeof engineCall.values !== 'object') return;
            let options: ChannelLogsQueryOptions = engineCall.values;
            var messages = await readChannel(this.instance.currentChannel, options);
            if (handler) handler(engineCall.command, messages);
        }
    }
}