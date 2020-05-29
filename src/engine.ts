import { Client, Guild, Channel } from "discord.js";
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
    values: Array<string>
}

interface EngineInstance {
    discordToken: string | null,
    currentGuild: Guild | null,
    currentChannel: Channel | null
}

export class Instance implements EngineInstance {
    constructor (public discordToken: string | null, public currentGuild: Guild | null, public currentChannel: Channel | null) {
        
    }
}

export class Call implements EngineCall {
    constructor (public command: string, public values: Array<string>) {
        
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
        this.instance = new Instance(discordToken, null, null);
    }

    addStack (engineCall: EngineCall) {
        this.stack.push(engineCall);
    }

    async executeStack (handler?: (command: string, callback: any) => void) {
        for (let i = 0; i < this.stack.length; i++) {
            await this.executeSingle(this.stack[i], handler);
        }

        this.stack = [];
    }

    async executeSingle (engineCall: EngineCall, handler?: (command: string, callback: any) => void) {
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
            this.instance.currentGuild = await fetchGuild(client, engineCall.values[0]);
            if (handler) handler(engineCall.command, this.instance.currentGuild);
        } else if (engineCall.command === 'fetchChannel') {
            if (!client) return;
            if (!/\d{18}/.test(engineCall.values[0])) return;
            this.instance.currentChannel = await fetchChannel(client, engineCall.values[0]);
            if (handler) handler(engineCall.command, this.instance.currentChannel);
        }
    }
}