import { SemanticAST } from '../../types/parser';
import { Token } from '../../types/tokens';
import { DiscordQueryParsingError } from '../errors';
import { EngineCall } from '../../types/engine';
import { Event } from '../../types/listener';

/**
     * Create callstack for listen keyword
     * @param semanticCommand - Parsed AST Entry
     */
export default function kListen (semanticCommand: SemanticAST, listenHandler: (event: Event) => void): Array<EngineCall> {
    const callstack: Array<EngineCall> = [];

    let listenCommand: 'listenClient' | 'listenGuild' | 'listenChannel' = 'listenChannel';
    let includeEvents = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'debug', 'warn', 'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'error', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildUnavailable', 'guildIntegrationsUpdate', 'guildMemberAdd', 'guildMemberAvailable', 'guildMemberRemove', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUpdate', 'inviteCreate', 'inviteDelete', 'message', 'messageDelete', 'messageReactionRemoveAll', 'messageReactionRemoveEmoji', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageUpdate', 'presenceUpdate', 'rateLimit', 'ready', 'invalidated', 'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'userUpdate', 'voiceStateUpdate', 'webhookUpdate', 'shardDisconnect', 'shardError', 'shardReady', 'shardReconnecting', 'shardResume'];
    if (semanticCommand.target === undefined) {
        listenCommand = 'listenClient';
    } else if (semanticCommand.target.annotation === Token.g) {
        if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
        listenCommand = 'listenGuild';
        callstack.push({ command: 'selectGuild', args: [semanticCommand.target.value] });
    } else if (semanticCommand.target.annotation === Token.c) {
        if (!/\d{18}/.test(semanticCommand.target.value)) throw new DiscordQueryParsingError(semanticCommand.target.index, semanticCommand.target.annotation);
        listenCommand = 'listenChannel';
        callstack.push({ command: 'selectChannel', args: [semanticCommand.target.value] });
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
    callstack.push({ command: listenCommand, args: [{ handler: listenHandler, includeEvents: includeEvents }] });
    return callstack;
}