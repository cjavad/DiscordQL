import { SemanticAST } from '../../types/ast';
import { Token } from '../../types/tokens';
import { EngineCall } from '../../types/engine';
import { DiscordQueryParsingError } from '../errors';

/**
* Create callstack for presence keyword
* @param semanticCommand - Parsed AST Entry
*/
export default function kPresence (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];
    if (semanticCommand.values.length === 1 && semanticCommand.values[0].key === Token.OBJECT) {
        let newPresence: Record<string, unknown> = {};
        try {
            newPresence = JSON.parse(semanticCommand.values[0].value);
            callstack.push({ command: 'updatePrecense', args: [newPresence] });
        } catch (error) {
            throw new DiscordQueryParsingError(semanticCommand.values[0].index, semanticCommand.values[0].key);
        }
    }
    return callstack;
}