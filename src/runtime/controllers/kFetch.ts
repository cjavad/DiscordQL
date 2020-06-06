import { SemanticAST } from '../../types/ast';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';

export default function kFetch (semanticCommand: SemanticAST): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];

    if (semanticCommand.target) {
        if (semanticCommand.target.annotation === Token.g) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value] });
        } else if (semanticCommand.target.annotation === Token.c) {
            if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
            callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
        }
    }

    if (semanticCommand.values.length) {
        for (let i = 0; i < semanticCommand.values.length; i++) {
            if (semanticCommand.values[i].annotation === Token.g) {
                if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                callstack.push({ command: 'fetchGuild', args: [semanticCommand.values[i].value]  });
            } else if (semanticCommand.values[i].annotation === Token.c) {
                if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                callstack.push({ command: 'fetchChannel', args: [semanticCommand.values[i].value]  });
            } else if (semanticCommand.values[i].annotation === Token.m) {
                if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                callstack.push({ command: 'readChannel', args: [{ limit: 1, around: semanticCommand.values[i].value }]  });
            } else if (semanticCommand.values[i].annotation === Token.u) {
                if (semanticCommand.target) {
                    if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation as Token);
                    callstack.push({ command: 'fetchMember', args: [semanticCommand.values[i].value] });
                } else {
                    if (!/\d{18}/.test(semanticCommand.values[i].value)) throw new DiscordQueryParsingError(semanticCommand.values[i].index, semanticCommand.values[i].annotation as Token);
                    callstack.push({ command: 'fetchUser', args: [semanticCommand.values[i].value] });
                }
            }
        }
    }

    return callstack;
}