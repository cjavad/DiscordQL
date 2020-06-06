import { SemanticAST } from '../../types/ast';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

/**
* Create callstack for delete keyword
 * @param semanticCommand - Parsed AST Entry
*/
export default function kDelete (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];

    const options: Record<string, any> = {
        limit: -1
    };

    if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
        callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
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
            callstack.push({ command: 'deleteMessage', args: [value.value] });
        }
    }

    if (options.limit > -1) {
        callstack.push({ command: 'deleteMessages', args: [options] });
    }
    return callstack;
}