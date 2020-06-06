import { SemanticAST } from '../../types/ast';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

/**
     * Create callstack for send keyword
     * @param semanticCommand - Parsed AST Entry
     */
export default function kSend (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];
    const options: Record<string, any> = {
        content: '',
        embeds: [],
        attachments: []
    };

    if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
        callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
    }

    for (let i = 0; i < semanticCommand.values.length; i++) {
        const value = semanticCommand.values[i];
        if (value.key === Token.STRING && value.annotation === Token.A) {
            options.attachments.push(value.value);
        } else if (value.key === Token.OBJECT) {
            try {
                const embed = JSON.parse(value.value);
                options.embeds.push(embed);
            } catch (error) {
                throw new DiscordQueryParsingError(value.index, value.key);
            }
        } else if (value.key === Token.STRING) {
            options.content += value.value + '\n';
        }
    }

    callstack.push({ command: 'sendMessage', args: [options] });
    return callstack;
}