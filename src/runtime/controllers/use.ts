import { SemanticAST } from '../../types/ast';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

/**
* Create callstack for use keyword
* @param semanticCommand - Parsed AST Entry
*/
export default function kUse (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];
    if (!semanticCommand.values.length) throw new DiscordQueryParsingError(semanticCommand.command.index, semanticCommand.command.key);
    for (let i = 0; i < semanticCommand.values.length; i++) {
        const value = semanticCommand.values[i];
        if (value.annotation === Token.t) {
            if (!/.{24}\..{6}\..{27}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
            callstack.push({ command: 'login', args: [value.value] });
        } else if (value.annotation === Token.g) {
            if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
            callstack.push({ command: 'selectGuild', args: [value.value] });
        } else if (value.annotation === Token.c) {
            if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
            callstack.push({ command: 'selectChannel', args: [value.value] });
        } else {
            throw new DiscordQueryParsingError(value.index, Token.USE);
        }
    }
    return callstack;
}