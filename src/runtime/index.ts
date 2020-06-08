import { Lexer } from './lexer';
import { Token } from '../types/tokens';
import { SemanticAST } from '../types/ast';
import { Parser } from './parser';
import { EngineCall, EngineCommands } from '../types/engine';
import { Event } from '../types/listener';
import { ClientEvents, DiscordAPIError } from 'discord.js';
import { Engine } from '../engine';
import { DiscordQueryRuntimeError } from './errors';
import kUse from './controllers/use';
import kListen from './controllers/listen';
import kFetch from './controllers/fetch';
import kRead from './controllers/read';
import kDelete from './controllers/delete';
import kSend from './controllers/send';
import kEdit from './controllers/edit';
import kShow from './controllers/show';
import kPresence from './controllers/presence';

/** DiscordQuery class converting .dq source code into engine commands */
export class DiscordQuery {
    /** Engine instance */
    private engine!: Engine;
    /** Engine commands to execute in order */
    private _callstack: Array<EngineCall>;
    /** Listener for discord events */
    private listenHandler: ((event: Event<keyof ClientEvents>) => void);
    /** Callback handler for all commands */
    private callbackHandler: (command: keyof EngineCommands, value: any) => void;
    /** Variable that decided if outputted is passed to a handler or console */
    public raw: boolean;

    /** Initilizes values */
    constructor () {
        this._callstack = [];
        this.listenHandler = console.log;
        this.callbackHandler = console.log;
        this.raw = false;
    }

    /** Used to set a custom event listernes */
    set listener (handler: (event: Event<keyof ClientEvents>) => void) {
        this.listenHandler = handler;
    }

    /** Used to set custom a handler for command return values */
    set callback (callback: (command: keyof EngineCommands, values: any) => void) {
        this.callbackHandler = callback;
    }

    /** Expose engineCallstack */
    get callstack (): Array<EngineCall> {
        return this._callstack;
    }

    /**
     * Lex -> Parse -> and convert code into callable stacks
     * @param src - discordquery source / query code
     */
    public parse (src: string): void {
        const lexer = new Lexer(src);
        const parser = new Parser(lexer);
        this.generate(parser.semantic);
    }

    /**
     * Main runner function that initilizes the discord engine and runs all commands parsed from the source.
     * @param killOnEnd - Expresses whether the engine client should be stopped when all commands have finished executed, or if it should wait until the entire program exits.
     * @param discordToken - Discord bot token if passed it uses this to login to the discord bot
     * @param guildID - Discord guild id, if the discord id has been passed it will select this guild.
     * @param channelID Discord channel id, if the guild id has been passed it will select this channel.
     */
    public async execute (killOnEnd: boolean, discordToken?: string, guildID?: string, channelID?: string): Promise<void> {
        if (!this.engine) {
            this.engine = new Engine(discordToken);
        }

        if (discordToken !== undefined && /.{24}\..{6}\..{27}/.test(discordToken)) {
            if (!this.engine.client.token) {
                await this.engine.login(discordToken);
            }

            if (guildID !== undefined && /\d{18}/.test(guildID)) {
                await this.engine.execute('selectGuild', guildID);

                if (channelID !== undefined && /\d{18}/.test(channelID)) {
                    await this.engine.execute('selectChannel', channelID);
                }
            }
        }

        const removeAmount = this._callstack.length;

        for (let i = 0; i < this._callstack.length; i++) {
            try {
                const value = await this.engine.execute(this._callstack[i].command, ...this._callstack[i].args);
                this.callbackHandler(this._callstack[i].command, value);
            } catch (error) {
                let newError: DiscordQueryRuntimeError;
                if (error instanceof DiscordAPIError) {
                    newError = new DiscordQueryRuntimeError(this._callstack[i].command, this.engine, error);
                } else {
                    newError = new DiscordQueryRuntimeError(this._callstack[i].command, this.engine);
                }
                this._callstack = this._callstack.slice(removeAmount);
                throw newError;
            }
        }

        this._callstack = this._callstack.slice(removeAmount);

        if (killOnEnd) {
            this.engine.client.destroy();
        }
    }

    /** Relogs into discord, returns true if the reload was succesful */
    public async reload (): Promise<boolean> {
        if (this.engine.client.token) {
            const token = this.engine.client.token;
            this.engine.client.destroy();
            await this.engine.login(token);
            return true;
        }
        return false;
    }

    /** Run functions to create engine callstack */
    private generate (semantic: Array<SemanticAST>): void {
        for (let i = 0; i < semantic.length; i++) {
            const semanticCommand = semantic[i];
            switch (semanticCommand.command.key) {
                case Token.USE: this._callstack.push(...kUse(semanticCommand)); break;
                case Token.LISTEN: this.callstack.push(...kListen(semanticCommand, this.listenHandler)); break;
                case Token.FETCH: this._callstack.push(...kFetch(semanticCommand)); break;
                case Token.READ: this._callstack.push(...kRead(semanticCommand)); break;
                case Token.DELETE: this._callstack.push(...kDelete(semanticCommand)); break;
                case Token.SEND: this._callstack.push(...kSend(semanticCommand)); break;
                case Token.EDIT: this._callstack.push(...kEdit(semanticCommand)); break;
                case Token.SHOW: this._callstack.push(...kShow(semanticCommand)); break;
                case Token.PRESENCE: this._callstack.push(...kPresence(semanticCommand)); break;
                case Token.RAW: this.raw = this.raw ? false : true; break;
            }
        }
    }
}