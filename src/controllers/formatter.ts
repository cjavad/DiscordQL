import { EngineCommands } from '../types/engine';
import { SerialGuild, SerialChannel, SerialMessage, SerialMember, SerialUser, SerialEmoji, SerialReaction, SerialRole, SerialPresence, SerialVoid } from '../types/serial';
import chalk from 'chalk';
import { ClientEvents } from 'discord.js';

/** Class formatting serialized data into neat printable output */
export default class Formatter {
    /**
     * Handles an engine command and its serialized input, and returns a formatted string.
     * @param command - Engine command
     * @param values - Value returned by engine command
     */
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

    /**
     * Handles a discord event and returns a prinatable string containing the output of it
     * @param eventName - Discord ClientEvent name
     * @param serialArray - Array of serialized input
     */
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

    /** Polyfill function returning an empty string */
    static void (): string {
        return '';
    }

    /**
     * Date parser expressing all dates for the output
     * @param date - Date object
     */
    static date (date: Date): string {
        return new Intl.DateTimeFormat('en', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        })
        .format(date).replace(/\,/, '');
    }

    /**
     * Formats a array of guilds into a single string
     * @param guilds - Array of serialized guilds to contain in one string
     */
    static guilds (guilds: Array<SerialGuild>): string {
        let formatted = `Guild Count ${guilds.length}\n`;
        guilds.reverse();
        guilds.forEach(guild => formatted += this.guild(guild) + '\n');
        return formatted;
    }

    /**
     * Formats a array of channels into a single string
     * @param channels - Array of serialized channels to contain in one string
     */
    static channels (channels: Array<SerialChannel>): string {
        let formatted = `Channel Count ${channels.length}\n`;
        channels.reverse();
        channels.forEach(channel => formatted += this.channel(channel) + '\n');
        return formatted;
    }

    /**
     * Formats a array of messages into a single string
     * @param messages - Array of serialized messages to contain in one string
     */
    static messages (messages: Array<SerialMessage>): string {
        let formatted = `Message Count: ${messages.length}\n`;
        messages.reverse();
        messages.forEach(message => formatted += this.message(message) + '\n');
        return formatted;
    }

    /**
     * Formats a array of members into a single string
     * @param members - Array of serialized members to contain in one string
     */
    static members (members: Array<SerialMember>): string {
        let formatted = `Member Count: ${members.length}\n`;
        members.reverse();
        members.forEach(member => formatted += this.member(member) + ' ');
        return formatted;
    }

    /**
     * Formats a single serialized message into a console ready string
     * @param message - Serialized message object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static message (message: SerialMessage, partial?: boolean): string {
        const date = message.createdAt as Date;
        let formatted = '';
        formatted += chalk.green(message.channel.name);
        formatted += ' ' + chalk.bgGray(this.date(date));
        formatted += ' ' + chalk.yellow(message.author.tag);
        formatted += ': ' + message.content;
        if (partial) return formatted;
        return `${chalk.cyan('MESSAGE')} ${formatted}`;
    }

     /**
     * Formats a single serialized user into a console ready string
     * @param user - Serialized user object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static user (user: SerialUser, partial?: boolean): string {
        let formatted = '';
        formatted += user.tag ? chalk.yellow(user.tag) + ' (' : '';
        formatted += chalk.blue(user.id) + user.tag ? ')' : '';
        formatted += ' ' + chalk.bgGray(this.date(user.createdAt));
        if (partial) return formatted;
        return `${user.bot ? chalk.cyan('BOT') : chalk.cyan('USER')} ${formatted}`;
    }

     /**
     * Formats a single serialized member into a console ready string
     * @param member - Serialized member object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static member (member: SerialMember, partial?: boolean): string {
        let formatted = '';
        formatted += member.user ? this.user(member.user, true) : chalk.yellow(member.id);
        formatted += member.joinedAt ? ' Joined: ' + chalk.bgGray(this.date(member.joinedAt)) : '';
        if (partial) return formatted;
        return `${member.user?.bot ? chalk.cyan('BOT') : chalk.cyan('MEMBER')} ${formatted}`;
    }

     /**
     * Formats a single serialized channel into a console ready string
     * @param channel - Serialized channel object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static channel (channel: SerialChannel, partial?: boolean): string {
        let formatted = '';
        formatted += chalk.magenta(channel.name);
        formatted += ' (' + chalk.green(channel.id) + ')';
        formatted += ' ^' + channel.position;
        formatted += channel.createdAt ? ' ' + chalk.bgGray(this.date(channel.createdAt as Date)) : '';
        if (partial) return formatted;
        return `${chalk.cyan('CHANNEL')} ${formatted}`;
    }

     /**
     * Formats a single serialized guild into a console ready string
     * @param guild - Serialized guild object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static guild (guild: SerialGuild, partial?: boolean): string {
        let formatted = '';
        formatted += chalk.blue(guild.name);
        formatted += ' (' + chalk.red(guild.id) + ')';
        formatted += ' Region: ' + chalk.green(guild.region);
        formatted += ' Members: ' + chalk.red(guild.memberCount);
        formatted += guild.owner ? (guild.owner.user ? ' Owner: ' + guild.owner.user.tag : '') : '';
        formatted += guild.owner ? (!guild.owner.user ? 'Owner:' : '') + ' (' + chalk.blue(guild.owner.id) + ')' : '';
        formatted += guild.createdAt ? ' ' + chalk.bgGray(this.date(guild.createdAt)) : '';
        if (partial) return formatted;
        return `${chalk.cyan('GUILD')} ${formatted}`;
    }

     /**
     * Formats a single serialized emoji into a console ready string
     * @param emoji - Serialized emoji object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static emoji (emoji: SerialEmoji, partial?: boolean): string {
        let formatted = '';
        formatted += ':' + emoji.name + ':';
        formatted += ' (' + chalk.bgYellowBright(emoji.id) + ')';
        if (partial) return formatted;
        return `${chalk.cyan('EMOJI')} ${formatted} ${emoji.createdAt ? 'Created: ' + this.date(emoji.createdAt) : ''}`;
    }

     /**
     * Formats a single serialized reaction into a console ready string
     * @param reaction - Serialized reaction object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static reaction (reaction: SerialReaction, partial?: boolean): string {
        let formatted = '';
        formatted += this.emoji(reaction.emoji, true);
        formatted += ' x ' + (reaction.count || 1).toString();
        formatted += ' ' + this.message(reaction.message, true);
        if (partial) return formatted;
        return `${chalk.cyan('REACTION')} ${formatted}`;
    }

     /**
     * Formats a single serialized role into a console ready string
     * @param role - Serialized role object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static role (role: SerialRole, partial?: boolean): string {
        let formatted = JSON.stringify(role);
        formatted = '';
        if (partial) return formatted;
        return formatted;
    }

     /**
     * Formats a single serialized presence into a console ready string
     * @param presence - Serialized presence object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static presence (presence: SerialPresence, partial?: boolean): string {
        let formatted = '';
        formatted += presence.member ? this.member(presence.member, true) : '';
        formatted += ' Status: ' + presence.status;
        formatted += ' ' + presence.activities.map(activity => `${activity.emoji ? ':' + activity.emoji + ': ' : ''}${activity.name} ${chalk.bgGray(this.date(activity.createdAt))}`).join(' ');
        if (partial) return formatted;
        return `${chalk.cyan('PRESENCE')} ${formatted}`;
    }
}