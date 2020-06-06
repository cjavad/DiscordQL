/** TODO: Document this file */
import { EngineCommands } from '../types/engine';
import { SerialGuild, SerialChannel, SerialMessage, SerialMember, SerialUser, SerialEmoji, SerialReaction, SerialRole, SerialPresence, SerialVoid } from '../types/serial';
import chalk from 'chalk';
import { ClientEvents } from 'discord.js';

export default class Formatter {
    static formatQuery (command: keyof EngineCommands, values: Array<SerialVoid | SerialMessage | SerialUser | SerialMember | SerialChannel | SerialGuild | SerialEmoji | SerialReaction | SerialRole | SerialPresence | any>): string {
        if (!values.length) return this.void();
        if (values[0].type === 'void') return this.void();
        switch (command) {
            case 'selectGuild': return this.guild(values[0]);
            case 'selectChannel': return this.channel(values[0]);
            case 'fetchGuild': return this.guild(values[0]);
            case 'fetchChannel': return this.channel(values[0]);
            case 'fetchUser':  return this.user(values[0]);
            case 'fetchMember': return this.member(values[0]);
            case 'showGuilds': return this.guilds(values);
            case 'showChannels': return this.channels(values);
            case 'showMembers':  return this.members(values);
            case 'updatePrecense': return this.void();
            case 'sendMessage': return this.message(values[0]);
            case 'editMessage': return this.message(values[0]);
            case 'deleteMessage': return this.message(values[0]);
            case 'deleteMessages': return this.messages(values);
            case 'readChannel': return this.messages(values);
            case 'listenClient': return this.void();
            case 'listenGuild': return this.void();
            case 'listenChannel': return this.void();
            default: return this.void();
        }
    }

    static formatEvent (eventName: keyof ClientEvents, serialArray: Array<SerialVoid | SerialMessage | SerialUser | SerialMember | SerialChannel | SerialGuild | SerialEmoji | SerialReaction | SerialRole | SerialPresence | any>): Array<string> {
        if (!serialArray.length) return [this.void()];
        if (!serialArray[0]) return [this.void()];
        if (serialArray.length === 2 && !serialArray[1]) return [this.void()];
        switch (eventName) {
            case 'channelCreate': return [this.channel(serialArray[0])];
            case 'channelDelete': return [this.channel(serialArray[0])];
            case 'channelPinsUpdate': return [this.channel(serialArray[0]), serialArray[1]];
            case 'channelUpdate': return [this.channel(serialArray[0]), this.channel(serialArray[1] as any)];
            case 'emojiCreate': return [this.emoji(serialArray[0])];
            case 'emojiDelete': return [this.emoji(serialArray[0])];
            case 'emojiUpdate': return [this.emoji(serialArray[0]), this.emoji(serialArray[1] as SerialEmoji)];
            case 'guildBanAdd': return [this.guild(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'guildBanRemove': return [this.guild(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'guildCreate':  return [this.guild(serialArray[0])];
            case 'guildDelete':  return [this.guild(serialArray[0])];
            case 'guildMemberAdd': return [this.member(serialArray[0])];
            case 'guildMemberAvailable': return [this.member(serialArray[0])];
            case 'guildMemberRemove': return [this.member(serialArray[0])];
            case 'guildMembersChunk':  return [this.members(serialArray[0]), this.guild(serialArray[1] as SerialGuild)];
            case 'guildMemberSpeaking': return [this.member(serialArray[0]), serialArray[1]];
            case 'guildMemberUpdate': return [this.member(serialArray[0]), this.member(serialArray[1] as SerialMember)];
            case 'guildUnavailable': return [this.guild(serialArray[0])];
            case 'guildUpdate': return [this.guild(serialArray[0]), this.guild(serialArray[1] as SerialGuild)];
            case 'message': return [this.message(serialArray[0])];
            case 'messageDelete': return [this.message(serialArray[0])];
            case 'messageDeleteBulk': return [this.messages(serialArray[0])];
            case 'messageUpdate': return [this.message(serialArray[0]), this.message(serialArray[1] as SerialMessage)];
            case 'messageReactionAdd': return [this.reaction(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'messageReactionRemove': return [this.reaction(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'messageReactionRemoveAll': return [this.message(serialArray[0])];
            case 'roleCreate': return [this.role(serialArray[0])];
            case 'roleDelete': return [this.role(serialArray[0])];
            case 'roleUpdate': return [this.role(serialArray[0]), this.role(serialArray[1] as SerialRole)];
            case 'presenceUpdate': return [this.presence(serialArray[0]), this.presence(serialArray[1] as SerialPresence)];
            case 'typingStart': return [this.channel(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'userUpdate': return [this.user(serialArray[0]), this.user(serialArray[1] as SerialUser)];
            case 'voiceStateUpdate':  return [this.member(serialArray[0]), this.member(serialArray[1] as SerialMember)];
            default: return [this.void()];
        }
    }

    static void (): string {
        return '';
    }

    static date (date: Date): string {
        return new Intl.DateTimeFormat('en', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        })
        .format(date).replace(/\,/, '');
    }

    static guilds (guilds: Array<SerialGuild>): string {
        let formatted = `Guild Count ${guilds.length}\n`;
        guilds.reverse();
        guilds.forEach(guild => formatted += this.guild(guild) + '\n');
        return formatted;
    }

    static channels (channels: Array<SerialChannel>): string {
        let formatted = `Channel Count ${channels.length}\n`;
        channels.reverse();
        channels.forEach(channel => formatted += this.channel(channel) + '\n');
        return formatted;
    }

    static messages (messages: Array<SerialMessage>): string {
        let formatted = `Message Count: ${messages.length}\n`;
        messages.reverse();
        messages.forEach(message => formatted += this.message(message) + '\n');
        return formatted;
    }

    static members (members: Array<SerialMember>): string {
        let formatted = `Member Count: ${members.length}\n`;
        members.reverse();
        members.forEach(member => formatted += this.member(member) + '\n');
        return formatted;
    }

    static message (message: SerialMessage): string {
        const date = message.createdAt as Date;
        return `${chalk.bgGray(this.date(date))} ${chalk.yellow(message.author.tag)}: ${message.content}`;
    }

    static user (user: SerialUser): string {
        const date = user.createdAt as Date;
        return `${user.bot ? chalk.cyan('BOT') : chalk.cyan('USER')} ${chalk.yellow(user.tag)} (${chalk.blue(user.id)}) Created: ${chalk.bgGray(this.date(date))}`;
    }

    static member (member: SerialMember): string {
        return `${member.user?.bot ? chalk.cyan('BOT') : chalk.cyan('MEMBER')} ${chalk.yellow(member.user?.tag)} (${chalk.blue(member.id)}) Created: ${chalk.bgGray(this.date(member.user?.createdAt as Date))} Display: ${chalk.hex(member.displayHexColor)(member.displayName)} Joined: ${chalk.bgGray(this.date(member.joinedAt as Date))}`;
    }

    static channel (channel: SerialChannel): string {
        return `${chalk.cyan('CHANNEL')} ${chalk.magenta(channel.name)} (${chalk.green(channel.id)}) Position: ${channel.position} Created: ${chalk.bgGray(this.date(channel.createdAt as Date))}`;
    }

    static guild (guild: Record<string, any>): string {
        return `${chalk.cyan('GUILD')} ${chalk.blue(guild.name)} (${chalk.red(guild.id)}) Region: ${guild.region} Members: ${guild.memberCount} ${guild.owner ? `Owner: ${chalk.yellow(guild.owner.tag)} (${chalk.blue(guild.owner.id)})` : ''}  Created: ${chalk.bgGray(this.date(guild.createdAt as Date))}`;
    }

    /** TODO: All of these */
    static emoji (emoji: SerialEmoji): string {
        let formatted = JSON.stringify(emoji);
        formatted = '';
        return formatted;
    }

    static reaction (reaction: SerialReaction): string {
        let formatted = JSON.stringify(reaction);
        formatted = '';
        return formatted;
    }

    static role (role: SerialRole): string {
        let formatted = JSON.stringify(role);
        formatted = '';
        return formatted;
    }

    static presence (presence: SerialPresence): string {
        let formatted = JSON.stringify(presence);
        formatted = '';
        return formatted;
    }
}