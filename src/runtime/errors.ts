import { EngineError } from '../engine/errors';
import { EngineCommand } from '../types/engine';
import { Engine } from '../engine';
import { DiscordAPIError } from 'discord.js';
import { Token, Keywords } from '../types/tokens';
import { keywords } from './lexer';

/** Error class for parser errors */
export class ParserError extends SyntaxError {
    /** Index in source where error occurred */
    index: number;

    /**
     * Creates error for parsing errors.
     * @param index - Index in source where error occurred
     * @param args - Additional error args.
     */
    constructor (index: number, ...args: Array<any>) {
        super(...args);
        this.index = index;
    }
}

export class DiscordQueryRuntimeError extends EngineError {
    constructor (public command: keyof EngineCommand, public engine: Engine, discordError?: DiscordAPIError, ...args: Array<any>) {
        super(command, engine, ...args);
        if (discordError) {
            this.message = discordError.message;
        }
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
            default: this.message = 'Invalid keyword'; break;
        }

        if (keywords[Token[token].toLowerCase() as keyof Keywords] !== undefined) {
            this.message = 'Invalid keyword value / vague keyword annotation';
        }
    }
}