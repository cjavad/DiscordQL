import { SemanticAST } from '../../types/parser';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

/**
     * Create callstack for read keyword
     * @param semanticCommand - Parsed AST Entry
     */
export default function kRead (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];
    const options: Record<string, unknown> = {
        limit: 50
    };

    if (!semanticCommand.target) throw new DiscordQueryParsingError(semanticCommand.command.index, semanticCommand.command.key);
    if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
        if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
        callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
    }

    if (!semanticCommand.values.length) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.command.key);
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

    callstack.push({ command: 'readChannel', args: [options] });
    return callstack;
}