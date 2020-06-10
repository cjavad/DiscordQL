import { SemanticAST } from '../../types/parser';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

/**
     * Create callstack for edit keyword
     * @param semanticCommand - Parsed AST Entry
     */
export default function kEdit (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];
    let messageID = '';

    const options: Record<string, any> = {
        content: '',
        embeds: [],
        attachments: []
    };

    if (!semanticCommand.target) throw new DiscordQueryParsingError(semanticCommand.command.index, semanticCommand.command.key);
    if (semanticCommand.target && semanticCommand.target.annotation === Token.c) {
        if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
        callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
    }

    for (let i = 0; i < semanticCommand.values.length; i++) {
        const value = semanticCommand.values[i];
        if (value.annotation === Token.m) {
            if (!/\d{18}/.test(value.value)) throw new DiscordQueryParsingError(value.index, value.annotation);
            messageID = value.value;
        } else if (value.key === Token.STRING && value.annotation === Token.A) {
            options.attachments.push(value.value);
        } else if (value.key === Token.OBJECT) {
            try {
                const embed = JSON.parse(value.value);
                options.embeds.push(embed);
            } catch (error) {
                throw new DiscordQueryParsingError(value.index, value.key);
            }
        } else if (value.key === Token.STRING && value.annotation === undefined) {
            options.content += value.value + '\n';
        }
    }

    if (!messageID) throw new DiscordQueryParsingError(semanticCommand.command.index, semanticCommand.command.key);
    callstack.push({ command: 'editMessage', args: [{ messageID: messageID, editOptions: options }] });
    return callstack;
}