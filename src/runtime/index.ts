import { Lexer } from './lexer';
import { Token } from './types/tokens';
import { SemanticAST, AnnotatedValue } from './types/ast';
import { Parser, Node, ParserError } from './parser';
import { EngineCall, EngineCommands } from '../engine/types/engine';
import { Event } from '../engine/types/listener';
import { ClientEvents } from 'discord.js';
import { Engine, EngineError } from '../engine';

export class DiscordQueryRuntimeError extends EngineError {
    constructor (public command: keyof EngineCommands, public engine: Engine, ...args: Array<any>) {
        super(command, engine, ...args);
    }
}

export class DiscordQueryParsingError extends ParserError {
    public message: string;

    constructor (public index: number, public token: Token, ...args: Array<any>) {
        super(index, ...args);
        switch (token) {
            case Token.t: this.message = 'Invalid Discord Token'; break;
            case Token.g: this.message = 'Invalid Discord guildID'; break;
            case Token.c: this.message = 'Invalid Discord channelID'; break;
            case Token.m: this.message = 'Invalid Discord messageID'; break;
            case Token.u: this.message = 'Invalid Discord userID'; break;
            case Token.OBJECT: this.message = 'Invalid JSON Object'; break;
            case Token.NUMBER: this.message = 'Invalid number'; break;
            default: this.message = 'Invalid values'; break;
        }
    }
}

/** DiscordQuery class converting .dq source code into engine commands */
export class DiscordQuery {
    /** Engine instance */
    private engine!: Engine;
    /** Abstract Syntax Tree from parser */
    private _ast: Array<Node>;
    /** Contexual stack */
    private _semantic: Array<SemanticAST>;
    /** Engine commands to execute in order */
    private _callstack: Array<EngineCall>;
    /** Listener for discord events */
    private listenHandler: ((event: Event<keyof ClientEvents>) => void);
    /** Callback handler for all commands */
    private callbackHandler: (command: keyof EngineCommands, value: any) => void;
    /** Variable that decided if outputted is passed to a handler or console */
    private raw: boolean;

    /** Initilizes values */
    constructor () {
        this._ast = [];
        this._semantic = [];
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
    set callback (callback: (values: any) => void) {
        this.callbackHandler = callback;
    }

    /** Expose semanticStack  */
    get semantic (): Array<SemanticAST> {
        return this._semantic;
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
        this._ast = parser.ast;
        this.semanticAST();
        this.generateCallStack();
    }

    /**
     * Main runner function that initilizes the discord engine and runs all commands parsed from the source.
     * @param killOnEnd - Expresses whether the engine client should be stopped when all commands have finished executed, or if it should wait until the entire program exits.
     * @param discordToken - Discord bot token if passed it uses this to login to the discord bot
     * @param guildID - Discord guild id, if the discord id has been passed it will select this guild.
     * @param channelID Discord channel id, if the guild id has been passed it will select this channel.
     */
    public async execute (killOnEnd: boolean, discordToken?: string, guildID?: string, channelID?: string): Promise<void> {
        this.engine = new Engine(discordToken);

        if (discordToken && /\w{24}\.\w{6}\.\w{27}/.test(discordToken)) {
            await this.engine.login(discordToken);

            if (guildID && /\d{18}/.test(guildID)) {
                await this.engine.execute('selectGuild', guildID);

                if (channelID && /\d{18}/.test(channelID)) {
                    await this.engine.execute('selectChannel', channelID);
                }
            }
        }

        for (let i = 0; i < this._callstack.length; i++) {
            try {
                this.callbackHandler(this._callstack[i].command, await this.engine.execute(this._callstack[i].command, ...this._callstack[i].args));
                this._callstack.splice(i, 1);
            } catch (error) {
                throw new DiscordQueryRuntimeError(this._callstack[i].command, this.engine, error);
            }
            this._callstack.splice(i, 1);
        }

        if (killOnEnd) {
            this.engine.client.destroy();
        }
    }

    /**
     * Create callstack for use keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kUse (semanticCommand: SemanticAST): void {
        for (let i = 0; i < semanticCommand.values.length; i++) {
            const value = semanticCommand.values[i];
            if (value.annotation === Token.t) {
                if (!/\w{24}\.\w{6}\.\w{27}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
                this._callstack.push({ command: 'login', args: [value.value]});
            }

            if (value.annotation === Token.g) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
                this._callstack.push({ command: 'selectGuild', args: [value.value]});
            }

            if (value.annotation === Token.c) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
                this._callstack.push({ command: 'selectChannel', args: [value.value]});
            }
        }
    }

    /**
     * Create callstack for listen keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kListen (semanticCommand: SemanticAST): void {
        let listenCommand: 'listenClient' | 'listenGuild' | 'listenChannel' = 'listenChannel';
        let includeEvents = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'debug', 'warn', 'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'error', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildUnavailable', 'guildIntegrationsUpdate', 'guildMemberAdd', 'guildMemberAvailable', 'guildMemberRemove', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUpdate', 'inviteCreate', 'inviteDelete', 'message', 'messageDelete', 'messageReactionRemoveAll', 'messageReactionRemoveEmoji', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageUpdate', 'presenceUpdate', 'rateLimit', 'ready',   'invalidated', 'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'userUpdate', 'voiceStateUpdate', 'webhookUpdate', 'shardDisconnect', 'shardError', 'shardReady', 'shardReconnecting', 'shardResume'];
        if (semanticCommand.target === undefined) {
            listenCommand = 'listenClient';
        } else if (semanticCommand.target.annotation === Token.g) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            listenCommand = 'listenGuild';
            this._callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value]});
        } else if (semanticCommand.target.annotation === Token.c) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            listenCommand = 'listenChannel';
            this._callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value]});
        }

        if (semanticCommand.values.length > 0) {
            if (semanticCommand.values[0].key === Token.INCLUDE) {
                const includeValues: Array<string> = [];
                semanticCommand.values.forEach(val => includeValues.push(val.value));
                includeEvents = includeEvents.filter(val => includeValues.includes(val));
            } else if (semanticCommand.values[0].key === Token.EXCLUDE) {
                const excludeValues: Array<string> = [];
                semanticCommand.values.forEach(val => excludeValues.push(val.value));
                includeEvents = includeEvents.filter(val => !excludeValues.includes(val));
            }
        }
        this._callstack.push({ command: listenCommand, args: [{ handler: this.listenHandler, includeEvents: includeEvents }]});
    }

    /**
     * Create callstack for fetch keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kFetch (semanticCommand: SemanticAST): void {
        if (semanticCommand.target) {
            if (semanticCommand.target.annotation === Token.g) {
                if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
                this._callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value] });
            } else if (semanticCommand.target.annotation === Token.c) {
                if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
                this._callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
            }
        }

        if (semanticCommand.values.length) {
            for (let i = 0; i < semanticCommand.values.length; i++) {
                if (semanticCommand.values[i].annotation === Token.g) {
                    if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                    this._callstack.push({ command: 'fetchGuild', args: [semanticCommand.values[i].value]  });
                } else if (semanticCommand.values[i].annotation === Token.c) {
                    if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                    this._callstack.push({ command: 'fetchChannel', args: [semanticCommand.values[i].value]  });
                } else if (semanticCommand.values[i].annotation === Token.m) {
                    if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                    this._callstack.push({ command: 'readChannel', args: [{ limit: 1, around: semanticCommand.values[i].value }]  });
                } else if (semanticCommand.values[i].annotation === Token.u) {
                    if (semanticCommand.target) {
                        if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation as Token);
                        this._callstack.push({ command: 'fetchMember', args: [semanticCommand.values[i].value] });
                    } else {
                        if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                        this._callstack.push({ command: 'fetchUser', args: [semanticCommand.values[i].value] });
                    }
                }
            }
        }
    }

    /**
     * Create callstack for read keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kRead (semanticCommand: SemanticAST): void {
        const options: Record<string, unknown> = {
            limit: 50
        };

        if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            this._callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        for (let i = 0; i < semanticCommand.values.length; i++) {
            const value = semanticCommand.values[i];
            if (value.key === Token.LIMIT) {
                if (!/\d+/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.key);
                options.limit = Number(value.value);
            } else if (value.key === Token.BEFORE) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.before = value.value;
            } else if (value.key === Token.AFTER) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.after = value.value;
            } else if (value.key === Token.AROUND) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.around = value.value;
            }
        }

        this._callstack.push({ command: 'readChannel', args: [options] });
    }

    /**
     * Create callstack for delete keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kDelete (semanticCommand: SemanticAST): void {
        const options: Record<string, any> = {
            limit: -1
        };

        if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
            this._callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        for (let i = 0; i < semanticCommand.values.length; i++) {
            const value = semanticCommand.values[i];
            if (value.key === Token.LIMIT) {
                if (!/\d+/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.NUMBER);
                options.limit = Number(value.value);
            } else if (value.key === Token.BEFORE) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.before = value.value;
            } else if (value.key === Token.AFTER) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.after = value.value;
            } else if (value.key === Token.AROUND) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, Token.m);
                options.around = value.value;
            } else if (value.annotation === Token.m) {
                if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
                this._callstack.push({ command: 'deleteMessage', args: [value.value] });
            }
        }

        if (options.limit > -1) {
            this._callstack.push({ command: 'deleteMessages', args: [options] });
        }
    }

    /**
     * Create callstack for send keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kSend (semanticCommand: SemanticAST): void {
        const options: Record<string, any> = {
            content: '',
            embeds: [],
            attachments: []
        };

        if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
            this._callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        for (let i = 0; i < semanticCommand.values.length; i++) {
            const value = semanticCommand.values[i];
            if (value.key === Token.STRING && value.annotation === Token.A) {
                options.attachments.push(value.value);
            } else if (value.key === Token.OBJECT) {
                try {
                    const embed = this.parseObject(value.value);
                    options.embeds.push(embed);
                } catch (error) {
                    throw new DiscordQueryParsingError(value.index, value.key);
                }
            } else if (value.key === Token.STRING) {
                options.content += value.value + '\n';
            }
        }

        this._callstack.push({ command: 'sendMessage', args: [options] });
    }

    /**
     * Create callstack for edit keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kEdit (semanticCommand: SemanticAST): void {
        let messageID = '';

        const options: Record<string, any> = {
            content: '',
            embeds: [],
            attachments: []
        };

        if (semanticCommand.target && semanticCommand.target.annotation === Token.m) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            messageID = semanticCommand.target.value;
        }

        for (let i = 0; i < semanticCommand.values.length; i++) {
            const value = semanticCommand.values[i];
            if (value.key === Token.STRING && value.annotation === Token.A) {
                options.attachments.push(value.value);
            } else if (value.key === Token.OBJECT) {
                try {
                    const embed = this.parseObject(value.value);
                    options.embeds.push(embed);
                } catch (error) {
                    throw new DiscordQueryParsingError(value.index, value.key);
                }
            } else if (value.key === Token.STRING) {
                options.content += value.value + '\n';
            }
        }

        this._callstack.push({ command: 'editMessage', args: [{ messageID: messageID, editOptions: options }] });
    }

    /**
     * Create callstack for show keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kShow (semanticCommand: SemanticAST): void {
        if (semanticCommand.target && semanticCommand.target.annotation === Token.g) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            this._callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value] });
            this._callstack.push({ command: 'showChannels', args: [semanticCommand.target.value] });
            this._callstack.push({ command: 'showMembers', args: [semanticCommand.target.value] });
        } else {
            this._callstack.push({ command: 'showGuilds', args: [] });
        }
    }

    /**
     * Create callstack for presence keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kPresence (semanticCommand: SemanticAST): void {
        if (semanticCommand.values.length === 1 && semanticCommand.values[0].key === Token.OBJECT) {
            const newPresence = this.parseObject(semanticCommand.values[0].value);
            this._callstack.push({ command: 'updatePrecense', args: [newPresence] });
        }
    }

    /**
     * Create callstack for raw keyword, toggles raw parameter.
     * @param semanticCommand - Parsed AST Entry
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private kRaw (_semanticCommand: SemanticAST): void {
        this.raw = this.raw ? false : true;
    }

    /** Run functions to create engine callstack */
    private generateCallStack (): void {
        for (let i = 0; i < this._semantic.length; i++) {
            const semanticCommand = this._semantic[i];
            switch (semanticCommand.command) {
                case Token.USE: this.kUse(semanticCommand); break;
                case Token.LISTEN: this.kListen(semanticCommand); break;
                case Token.FETCH: this.kFetch(semanticCommand); break;
                case Token.READ: this.kRead(semanticCommand); break;
                case Token.DELETE: this.kDelete(semanticCommand); break;
                case Token.SEND: this.kSend(semanticCommand); break;
                case Token.EDIT: this.kEdit(semanticCommand); break;
                case Token.SHOW: this.kShow(semanticCommand); break;
                case Token.PRESENCE: this.kPresence(semanticCommand); break;
                case Token.RAW: this.kRaw(semanticCommand); break;
            }
            this._semantic.splice(i, 1);
        }
    }

    /** Parse AST */
    private semanticAST (): void {
        for (let i = 0; i < this._ast.length; i++) {
            this._semantic.push({
                command: this._ast[i].token,
                target: this.statementTarget(this._ast[i]),
                values: this.statementValues(this._ast[i])
            });
            this._ast.splice(i, 1);
        }
    }

    /**
     * Find targeted item by keyword
     * @param statement - Keyword node with entire statement tree
     */
    private statementTarget (statement: Node): AnnotatedValue | undefined {
        const optionals = this.keywordOptionals(statement.token);
        let target: AnnotatedValue = { index: 0, key: 0, value: '' };

        for (let i = 0; i < statement.children.length; i++) {
            const childNode = statement.children[i];
            if ([Token.FETCH, Token.SEND, Token.DELETE].indexOf(statement.token) > -1) {
                for (let j = 0; j < childNode.children.length; j++) {
                    if (optionals.indexOf(childNode.token) > -1) {
                        target = {
                            index: childNode.children[j].index,
                            key: childNode.children[j].token,
                            value: childNode.children[j].value as string,
                            annotation: childNode.children[j].annotation
                        };
                    }
                }
            } else if (!childNode.keyword && childNode.value && childNode.annotation) {
                    target = {
                        index: childNode.index,
                        key: childNode.token,
                        value: childNode.value,
                        annotation: childNode.annotation
                    };
                }
        }

        return target.value.length ? target : undefined;
    }

    /**
     * Find additional values given to the keywords
     * @param statement - Keyword node with entire statement tree
     */
    private statementValues (statement: Node): Array<AnnotatedValue> {
        const optionals = this.keywordOptionals(statement.token);
        const values: Array<AnnotatedValue> = [];

        for (let i = 0; i < statement.children.length; i++) {
            const childNode = statement.children[i];
            if ([Token.LISTEN, Token.READ, Token.DELETE].indexOf(statement.token) > -1) {
                if (childNode.keyword && optionals.indexOf(childNode.token) > -1) {
                    for (let j = 0; j < childNode.children.length; j++) {
                        values.push({
                            index: childNode.index,
                            key: childNode.token,
                            value: childNode.children[j].value as string,
                            annotation: childNode.children[j].annotation
                        });
                    }
                } else if (childNode.value && [Token.READ, Token.DELETE].indexOf(statement.token) > -1) {
                    values.push({
                        index: childNode.index,
                        key: childNode.token,
                        value: childNode.value,
                        annotation: childNode.annotation
                    });
                }
            } else if (childNode.keyword && optionals.indexOf(childNode.token) > -1 && [Token.SEND, Token.FETCH].indexOf(statement.token) < 0) {
                    for (let j = 0; j < childNode.children.length; j++) {
                        values.push({
                            index: childNode.index,
                            key: childNode.children[j].token,
                            value: childNode.children[j].value as string,
                            annotation: childNode.children[j].annotation
                        });
                    }
            } else if (childNode.value && (([Token.SEND, Token.FETCH].indexOf(statement.token) > -1) ? !childNode.keyword : true)) {
                values.push({
                    index: childNode.index,
                    key: childNode.token,
                    value: childNode.value,
                    annotation: childNode.annotation
                });
            }
        }

        return values;
    }

    /**
     * Return linked keywords
     * @param token - token enum
     */
    private keywordOptionals (token: Token): Array<Token> {
        switch (token) {
            case Token.USE: return [];
            case Token.LISTEN: return [Token.INCLUDE, Token.EXCLUDE];
            case Token.FETCH: return [Token.FROM];
            case Token.READ: return [Token.LIMIT, Token.BEFORE, Token.AFTER, Token.AROUND];
            case Token.DELETE: return [Token.LIMIT, Token.BEFORE, Token.AFTER, Token.AROUND, Token.IN];
            case Token.SEND: return [Token.IN];
            case Token.EDIT: return [Token.WITH];
            case Token.SHOW: return [];
            case Token.PRESENCE: return [];
            case Token.RAW: return [];
            default: return [];
        }
    }

    /**
     * Parse json object string
     * @param objectString - JSON string
     */
    public parseObject (objectString: string): Record<string, unknown> {
        if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(objectString)) {
            return JSON.parse(objectString);
        } else {
            // Invalid object
            throw new Error('Invalid JSON Object');
        }
    }
}