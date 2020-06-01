import { Client,  TextChannel, DMChannel, MessageOptions, ChannelLogsQueryOptions,  Guild, Message, PresenceData, User, GuildMember, Presence, GuildChannel } from "discord.js";
import { EngineInstance, EngineCommands, EngineCall, EngineListenOptions, EngineEditOptions } from "./@types/engine";
import fetchGuild from "./controllers/fetchGuild";
import fetchChannel from "./controllers/fetchChannel";
import fetchUser from "./controllers/fetchUser";
import fetchMember from "./controllers/fetchMember";
import showGuilds from "./controllers/showGuilds";
import showChannels from "./controllers/showChannels";
import updatePrecense from "./controllers/updatePresence";
import sendMessage from "./controllers/sendMessage";
import editMessage from "./controllers/editMessage";
import deleteMessage from "./controllers/deleteMessage";
import deleteMessages from "./controllers/deleteMessages";
import readChannel from "./controllers/readChannel";
import listenClient from "./controllers/listenClient";
import listenGuild from "./controllers/listenGuild";
import listenChannel from "./controllers/listenChannel";

class Instance implements EngineInstance {
    constructor (public discordToken: string, public currentGuild?: Guild, public currentChannel?: TextChannel | DMChannel) {
        
    }
}

class EngineError extends Error {
    command: keyof EngineCommands;
    clientConnected: boolean;
    guildSelected: boolean;
    channelSelected: boolean;

    constructor (command: keyof EngineCommands, engine: Engine,  ...params: any) {
        super(...params);
        Error.captureStackTrace(this, EngineError);
        this.name = 'EngineError';
        this.command = command;
        this.clientConnected = engine.client.token ? true : false;
        this.guildSelected = engine.instance.currentGuild ? true : false;
        this.channelSelected = engine.instance.currentChannel ? true : false;
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

    pushStack<K extends keyof EngineCommands> (command: K, args: EngineCommands[K]) {
        this.stack.push({
            command: command,
            args: args
        });
    }

    async executeStack (callback: (command: keyof EngineCommands, value: any) => void) {
        for (let i = 0; i < this.stack.length; i++) {
            var value = await this.execute(this.stack[i].command, ...this.stack[i].args);
            callback(this.stack[i].command, value);
            this.stack = this.stack.filter((_item, index) => index === i);
        }
    }

    async execute<K extends keyof EngineCommands> (command: K, ...args: EngineCommands[K] ): Promise<any> {
        if (!this.client.token) {
            await this.client.login(this.discordToken);
        }

        return new Promise((resolve, reject) => {
            switch (command) {
                case 'selectGuild': this.selectGuild(args[0] as string).then(resolve).catch(reject); break;
                case 'selectChannel': this.selectChannel(args[0] as string).then(resolve).catch(reject); break;
                case 'fetchGuild': this.fetchGuild(args[0] as string).then(resolve).catch(reject); break;
                case 'fetchChannel': this.fetchChannel(args[0] as string).then(resolve).catch(reject); break;
                case 'fetchUser':  this.fetchUser(args[0] as string).then(resolve).catch(reject); break;
                case 'fetchMember': this.fetchMember(args[0] as string).then(resolve).catch(reject); break;
                case 'showGuilds': this.showGuilds(args[0] ? args[0] as string : undefined).then(resolve).catch(reject); break;
                case 'showChannels': this.showChannels(args[0] ? args[0] as string : undefined).then(resolve).catch(reject); break;
                case 'updatePrecense': this.updatePrecense(args[0] as PresenceData).then(resolve).catch(reject); break;
                case 'sendMessage': this.sendMessage(args[0] as MessageOptions).then(resolve).catch(reject); break;
                case 'editMessage': this.editMessage(args[0] as EngineEditOptions).then(resolve).catch(reject); break;
                case 'deleteMessage': this.deleteMessage(args[0] as string).then(resolve).catch(reject); break;
                case 'deleteMessages': this.deleteMessages(args[0] as ChannelLogsQueryOptions).then(resolve).catch(reject); break;
                case 'readChannel': this.readChannel(args[0] as ChannelLogsQueryOptions).then(resolve).catch(reject); break;
                case 'listenClient': this.listenClient(args[0] as EngineListenOptions).then(resolve).catch(reject); break;
                case 'listenGuild': this.listenClient(args[0] as EngineListenOptions).then(resolve).catch(reject); break;
                case 'listenChannel': this.listenClient(args[0] as EngineListenOptions).then(resolve).catch(reject); break;
            }
        });
    }

    async selectGuild (guildID: string): Promise<Guild | undefined> {
        if (!this.client || !/\d{18}/.test(guildID)) throw new EngineError('selectGuild', this);
        this.instance.currentGuild = await fetchGuild(this.client, guildID);
        return this.instance.currentGuild;
    }

    async selectChannel (channelID: string): Promise<TextChannel | DMChannel | undefined> {
        if (!this.client || !/\d{18}/.test(channelID)) throw new EngineError('selectChannel', this);
        this.instance.currentChannel = await fetchChannel(this.client, channelID);
        return this.instance.currentChannel;
    }

    async fetchGuild (guildID: string): Promise<Guild | undefined> {
        if (!this.client || !/\d{18}/.test(guildID)) throw new EngineError('fetchGuild', this);
        var guild = await fetchGuild(this.client, guildID);
        return guild;
    }

    async fetchChannel (channelID: string): Promise<TextChannel | DMChannel | undefined> {
        if (!this.client || !/\d{18}/.test(channelID)) throw new EngineError('fetchChannel', this);
        var channel = await fetchChannel(this.client, channelID);
        return channel;
    }

    async fetchUser (userID: string): Promise<User | undefined> {
        if (!this.client || !/\d{18}/.test(userID)) throw new EngineError('fetchUser', this);
        var user = await fetchUser(this.client, userID);
        return user;
    }
    
    async fetchMember (userID: string): Promise<GuildMember | undefined> {
        if (!this.client || !this.instance.currentGuild || !/\d{18}/.test(userID)) throw new EngineError('fetchMember', this);
        var member = await fetchMember(this.instance.currentGuild, userID);
        return member;
    }

    async showGuilds (search?: string): Promise<Array<Guild>> {
        if (!this.client) throw new EngineError('showGuilds', this);
        var guilds = await showGuilds(this.client, search);
        return guilds;
    }

    async showChannels (search?: string): Promise<Array<GuildChannel>> {
        if (!this.client || !this.instance.currentGuild) throw new EngineError('showChannels', this);
        var channels = await showChannels(this.instance.currentGuild, search);
        return channels;
    }

    async updatePrecense (newPresence: PresenceData): Promise<Presence | undefined> {
        if (!this.client) throw new EngineError('updatePrecense', this);
        return await updatePrecense(this.client, newPresence);
    }

    async sendMessage (options: MessageOptions): Promise<Message> {
        if (!this.client || !this.instance.currentChannel) throw new EngineError('sendMessage', this);
        var message = await sendMessage(this.instance.currentChannel, options);
        return message;
    }

    async editMessage (options: EngineEditOptions): Promise<Message> {
        if (!this.client || !this.instance.currentChannel) throw new EngineError('editMessage', this);
        var message = await editMessage(this.instance.currentChannel, options.messageID, options.EngineEditOptions);
        return message;
    }

    async deleteMessage (messageID: string): Promise<Message> {
        if (!this.client || !this.instance.currentChannel || !/\d{18}/.test(messageID)) throw new EngineError('deleteMessage', this);
        var message = await deleteMessage(this.instance.currentChannel, messageID);
        return message;
    }

    async deleteMessages (options: ChannelLogsQueryOptions): Promise<Array<Message>> {
        if (!this.client || !this.instance.currentChannel) throw new EngineError('deleteMessages', this);
        var deletedMessages = await deleteMessages(this.instance.currentChannel as TextChannel, options);
        return deletedMessages.array();
    }

    async readChannel (options: ChannelLogsQueryOptions): Promise<Array<Message>> {
        if (!this.client || !this.instance.currentChannel) throw new EngineError('readChannel', this);
        var messages = await readChannel(this.instance.currentChannel, options);
        return messages.array();
    }

    async listenClient (options: EngineListenOptions): Promise<void> {
        if (!this.client) throw new EngineError('listenClient', this);
        return listenClient(this.client, options);
    }

    async listenGuild (options: EngineListenOptions): Promise<void> {
        if (!this.client || !this.instance.currentGuild) throw new EngineError('listenGuild', this);
        return listenGuild(this.client, this.instance.currentGuild, options);
    }

    async listenChannel (options: EngineListenOptions): Promise<void> {
        if (!this.client || !this.instance.currentChannel) throw new EngineError('listenChannel', this);
        return listenChannel(this.client, this.instance.currentChannel, options);
    }
}