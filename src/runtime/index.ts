import { Lexer } from './lexer';
import { Token } from './types/tokens';
import { SemanticAST, AnnotatedValue } from './types/ast';
import { Parser, Node } from './parser';
import { EngineCall } from '../engine/types/engine';
import { Event } from '../engine/types/listener';
import { ClientEvents } from 'discord.js';

/** DiscordQuery class converting .dq source code into engine commands */
export class DiscordQuery {
    /** Lexer instance */
    private lexer: Lexer;
    /** Parser instance */
    private parser: Parser;
    /** Abstract Syntax Tree from parser */
    private ast: Array<Node>;
    /** Contexual stack */
    private semanticStack: Array<SemanticAST> = [];
    /** Engine commands to execute in order */
    private engineCallstack: Array<EngineCall> = [];
    /** Listener for discord events */
    private listenHandler: ((event: Event<keyof ClientEvents>) => void) = console.log;

    /**
     * @param src - discordquery source / query code
     * @param discordToken - If passed it'll default to this bot token
     * @param guildId - If passed it'll default to this guild
     * @param channelId If passed it'll default to this channel
     */
    constructor (src: string) {
        this.lexer = new Lexer(src);
        this.parser = new Parser(this.lexer);
        this.ast = this.parser.ast;
        this.semanticAST();
        this.generateCallStack();
    }

    /** Enable custom event listernes */
    set listener (handler: (event: Event<keyof ClientEvents>) => void) {
        this.listenHandler = handler;
    }

    /** Expose semanticStack  */
    get semantic (): Array<SemanticAST> {
        return this.semanticStack;
    }

    /** Expose callstack */
    get callstack (): Array<EngineCall> {
        return this.engineCallstack;
    }

    /**
     * Create callstack for use keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kUse (semanticCommand: SemanticAST): void {
        semanticCommand.values.forEach(value => {
            if (value.annotation === Token.t) {
                this.callstack.push({ command: 'login', args: [value.value]});
            }

            if (value.annotation === Token.g) {
                this.callstack.push({ command: 'selectGuild', args: [value.value]});
            }

            if (value.annotation === Token.c) {
                this.callstack.push({ command: 'selectChannel', args: [value.value]});
            }
        });
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
                listenCommand = 'listenGuild';
                this.callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value]});
        } else if (semanticCommand.target.annotation === Token.c) {
                listenCommand = 'listenChannel';
                this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value]});
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
        this.callstack.push({ command: listenCommand, args: [{ handler: this.listenHandler, includeEvents: includeEvents }]});
    }

    /**
     * Create callstack for fetch keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kFetch (semanticCommand: SemanticAST): void {
        if (semanticCommand.target) {
            if (semanticCommand.target.annotation === Token.g) {
                this.callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value] });
            } else if (semanticCommand.target.annotation === Token.c) {
                this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
            }
        }

        if (semanticCommand.values.length === 1) {
            if (semanticCommand.values[0].annotation === Token.g) {
                this.callstack.push({ command: 'fetchGuild', args: [semanticCommand.values[0].value]  });
            } else if (semanticCommand.values[0].annotation === Token.c) {
                this.callstack.push({ command: 'fetchChannel', args: [semanticCommand.values[0].value]  });
            } else if (semanticCommand.values[0].annotation === Token.m) {
                this.callstack.push({ command: 'readChannel', args: [{ limit: 1, around: semanticCommand.values[0].value }]  });
            } else if (semanticCommand.values[0].annotation === Token.u) {
                if (semanticCommand.target) {
                    this.callstack.push({ command: 'fetchMember', args: [semanticCommand.values[0].value] });
                } else {
                    this.callstack.push({ command: 'fetchUser', args: [semanticCommand.values[0].value] });
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
            this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        if (semanticCommand.values) {
            semanticCommand.values.forEach((val) => {
                if (val.key === Token.LIMIT) {
                    options.limit = Number(val.value);
                } else if (val.key === Token.BEFORE) {
                    options.before = val.value;
                } else if (val.key === Token.AFTER) {
                    options.after = val.value;
                } else if (val.key === Token.AROUND) {
                    options.around = val.value;
                }
            });
        }
        this.callstack.push({ command: 'readChannel', args: [options] });
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
            this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        if (semanticCommand.values) {
            semanticCommand.values.forEach((val) => {
                if (val.key === Token.LIMIT) {
                    options.limit = Number(val.value);
                } else if (val.key === Token.BEFORE) {
                    options.before = val.value;
                } else if (val.key === Token.AFTER) {
                    options.after = val.value;
                } else if (val.key === Token.AROUND) {
                    options.around = val.value;
                } else if (val.key === Token.STRING) {
                    this.callstack.push({ command: 'deleteMessage', args: [val.value] });
                }
            });
        }
        if (options.limit > -1) {
            this.callstack.push({ command: 'deleteMessages', args: [options] });
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
            this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        if (semanticCommand.values) {
            semanticCommand.values.forEach(val => {
                if (val.key === Token.STRING && val.annotation === Token.A) {
                    options.attachments.push(val.value);
                } else if (val.key === Token.OBJECT) {
                    const embed = this.parseObject(val.value);
                    options.embeds.push(embed);
                } else if (val.key === Token.STRING) {
                    options.content += val.value + '\n';
                }
            });

            this.callstack.push({ command: 'sendMessage', args: [options] });
        }
    }

    /**
     * Create callstack for edit keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kEdit (semanticCommand: SemanticAST): void {
        const options: Record<string, any> = {
            content: '',
            embeds: [],
            attachments: []
        };

        if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
            this.callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }

        if (semanticCommand.values) {
            semanticCommand.values.forEach(val => {
                if (val.key === Token.STRING && val.annotation === Token.A) {
                    options.attachments.push(val.value);
                } else if (val.key === Token.OBJECT) {
                    const embed = this.parseObject(val.value);
                    options.embeds.push(embed);
                } else if (val.key === Token.STRING) {
                    options.content += val.value + '\n';
                }
            });

            this.callstack.push({ command: 'editMessage', args: [options] });
        }
    }

    /**
     * Create callstack for show keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kShow (semanticCommand: SemanticAST): void {
        if (semanticCommand.target && semanticCommand.target.annotation === Token.g) {
            this.callstack.push({ command: 'showChannels', args: [semanticCommand.target.value] });
            this.callstack.push({ command: 'showMembers', args: [semanticCommand.target.value] });
        } else {
            this.callstack.push({ command: 'showGuilds', args: [] });
        }
    }

    /**
     * Create callstack for presence keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kPresence (semanticCommand: SemanticAST): void {
        if (semanticCommand.values.length === 1 && semanticCommand.values[0].key === Token.OBJECT) {
            const newPresence = this.parseObject(semanticCommand.values[0].value);
            this.callstack.push({ command: 'updatePrecense', args: [newPresence] });
        }
    }

    /**
     * Create callstack for raw keyword
     * @param semanticCommand - Parsed AST Entry
     */
    private kRaw (semanticCommand: SemanticAST): void {
        // System variable
        semanticCommand;
    }

    /** Run functions to create engine callstack */
    private generateCallStack (): void {
        this.semanticStack.forEach((semanticCommand: SemanticAST) => {
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
        });
    }

    /** Parse AST */
    private semanticAST (): void {
        this.ast.forEach((statement: Node) => {
            this.semanticStack.push({ command: statement.token, target: this.statementTarget(statement), values: this.statementValues(statement) });
        });
    }

    /**
     * Find targeted item by keyword
     * @param statement - Keyword node with entire statement tree
     */
    private statementTarget (statement: Node): AnnotatedValue | undefined {
        let target: AnnotatedValue = { key: 0, value: '' };

        if (statement.token === Token.SEND) {
            statement.children.forEach(child => {
                if (child.token === Token.IN) {
                    child.children.forEach(child => {
                        target = { key: child.token, value: child.value as string, annotation: child.annotation };
                    });
                }
            });
        } else if (statement.token === Token.FETCH) {
            statement.children.forEach(child => {
                if (child.token === Token.FROM) {
                    child.children.forEach(child => {
                        target = { key: child.token, value: child.value as string, annotation: child.annotation };
                    });
                }
            });
        } else {
            statement.children.forEach(child => {
                if (!child.keyword && child.value && child.annotation) {
                    target = { key: child.token, value: child.value as string, annotation: child.annotation };
                }
            });
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

        if (statement.token === Token.SEND || statement.token === Token.FETCH) {
            statement.children.forEach(child => {
                if (!child.keyword && child.value) {
                    values.push({ key: child.token, value: child.value as string, annotation: child.annotation});
                }
            });
        } else if (statement.token === Token.LISTEN || statement.token === Token.READ || statement.token === Token.DELETE) {
            statement.children.forEach(child => {
                if (child.keyword && optionals.indexOf(child.token) > -1) {
                    child.children.forEach(vChild => {
                        values.push({ key: child.token, value: vChild.value as string, annotation: vChild.annotation });
                    });
                } else if (child.value && (statement.token === Token.READ || statement.token === Token.DELETE)) {
                    values.push({ key: child.token, value: child.value, annotation: child.annotation });
                }
            });
        } else {
            statement.children.forEach(child => {
                if (child.keyword && optionals.indexOf(child.token) > -1) {
                    child.children.forEach(child => {
                        values.push({ key: child.token, value: child.value as string, annotation: child.annotation });
                    });
                } else if (child.value) {
                    values.push({ key: child.token, value: child.value, annotation: child.annotation });
                }
            });
        }

        return values;
    }

    /**
     * Return linked keywords
     * @param token - token enum
     */
    private keywordOptionals (token: Token): Array<Token> {
        if (this.parser.isSeperate(token)) {
            switch (token) {
                case Token.USE: return [];
                case Token.LISTEN: return [Token.INCLUDE, Token.EXCLUDE];
                case Token.FETCH: return [Token.FROM];
                case Token.READ: return [Token.LIMIT, Token.BEFORE, Token.AFTER, Token.AROUND];
                case Token.DELETE: return [Token.LIMIT, Token.BEFORE, Token.AFTER, Token.AROUND];
                case Token.SEND: return [Token.IN];
                case Token.EDIT: return [Token.WITH];
                case Token.SHOW: return [];
                case Token.PRESENCE: return [];
                case Token.RAW: return [];
            }
        }

        return [];
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