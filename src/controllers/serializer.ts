import { EngineCommands } from '../types/engine';
import { SerialVoid, SerialMessage, SerialUser, SerialMember, SerialChannel, SerialGuild, SerialEmoji, SerialReaction, SerialRole, SerialPresence, SerialActivity, SerialPermissions } from '../types/serial';
import { Event } from '../types/listener';
import { ClientEvents, Emoji, User, Guild, GuildMember, Message, Role, Presence, TextChannel, GuildChannel, MessageReaction, Permissions, Activity, PermissionString } from 'discord.js';

/** Huge class contaning functions to serialize discord.js classes into simple objects */
export default class Serializer {
    /**
     * Serialize a callback from the engine and its value into an object
     * @param command - Engine command
     * @param value - The value returned by the engine command
     */
    static normalizeQuery (command: keyof EngineCommands, value: any): Array<SerialVoid | SerialMessage | SerialUser | SerialMember | SerialChannel | SerialGuild | SerialEmoji | SerialReaction | SerialRole | SerialPresence | SerialActivity | SerialPermissions> {
        if (!value) return [this.void()];
        switch (command) {
            case 'selectGuild': return [this.guild(value)];
            case 'selectChannel': return [this.channel(value)];
            case 'fetchGuild': return [this.guild(value)];
            case 'fetchChannel': return [this.channel(value)];
            case 'fetchUser':  return [this.user(value)];
            case 'fetchMember': return [this.member(value)];
            case 'showGuilds': return this.guilds(value);
            case 'showChannels': return this.channels(value);
            case 'showMembers':  return this.members(value);
            case 'updatePrecense': return [this.void()];
            case 'sendMessage': return [this.message(value)];
            case 'editMessage': return [this.message(value)];
            case 'deleteMessage': return [this.message(value)];
            case 'deleteMessages': return this.messages(value);
            case 'readChannel': return this.messages(value);
            case 'listenClient': return [this.void()];
            case 'listenGuild': return [this.void()];
            case 'listenChannel': return [this.void()];
            default: return [this.void()];
        }
    }

    /**
     * Serialize a discord event into a list of objects
     * @param event - Discord event containing the event name and the event params
     */
    static normalizeListener (event: Event<keyof ClientEvents>): Array<SerialVoid | SerialMessage | SerialUser | SerialMember | SerialChannel | SerialGuild | SerialEmoji | SerialReaction | SerialRole | SerialPresence | SerialActivity | SerialPermissions | any> {
        if (!event.params.length) return [this.void()];
        if (!event.params[0]) return [this.void()];
        if (event.params.length === 2 && !event.params[1]) return [this.void()];
        switch (event.name) {
            case 'channelCreate': return [this.channel(event.params[0])];
            case 'channelDelete': return [this.channel(event.params[0])];
            case 'channelPinsUpdate': return [this.channel(event.params[0]), event.params[1]];
            case 'channelUpdate': return [this.channel(event.params[0]), this.channel(event.params[1] as any)];
            case 'emojiCreate': return [this.emoji(event.params[0])];
            case 'emojiDelete': return [this.emoji(event.params[0])];
            case 'emojiUpdate': return [this.emoji(event.params[0]), this.emoji(event.params[1] as Emoji)];
            case 'guildBanAdd': return [this.guild(event.params[0]), this.user(event.params[1] as User)];
            case 'guildBanRemove': return [this.guild(event.params[0]), this.user(event.params[1] as User)];
            case 'guildCreate':  return [this.guild(event.params[0])];
            case 'guildDelete':  return [this.guild(event.params[0])];
            case 'guildMemberAdd': return [this.member(event.params[0])];
            case 'guildMemberAvailable': return [this.member(event.params[0])];
            case 'guildMemberRemove': return [this.member(event.params[0])];
            case 'guildMembersChunk':  return [this.members(event.params[0]), this.guild(event.params[1] as Guild)];
            case 'guildMemberSpeaking': return [this.member(event.params[0]), event.params[1]];
            case 'guildMemberUpdate': return [this.member(event.params[0]), this.member(event.params[1] as GuildMember)];
            case 'guildUnavailable': return [this.guild(event.params[0])];
            case 'guildUpdate': return [this.guild(event.params[0]), this.guild(event.params[1] as Guild)];
            case 'message': return [this.message(event.params[0])];
            case 'messageDelete': return [this.message(event.params[0])];
            case 'messageDeleteBulk': return [this.messages(event.params[0])];
            case 'messageUpdate': return [this.message(event.params[0]), this.message(event.params[1] as Message)];
            case 'messageReactionAdd': return [this.reaction(event.params[0]), this.user(event.params[1] as User)];
            case 'messageReactionRemove': return [this.reaction(event.params[0]), this.user(event.params[1] as User)];
            case 'messageReactionRemoveAll': return [this.message(event.params[0])];
            case 'roleCreate': return [this.role(event.params[0])];
            case 'roleDelete': return [this.role(event.params[0])];
            case 'roleUpdate': return [this.role(event.params[0]), this.role(event.params[1] as Role)];
            case 'presenceUpdate': return [this.presence(event.params[0]), this.presence(event.params[1] as Presence)];
            case 'typingStart': return [this.channel(event.params[0]), this.user(event.params[1] as User)];
            case 'userUpdate': return [this.user(event.params[0]), this.user(event.params[1] as User)];
            case 'voiceStateUpdate':  return [this.member(event.params[0]), this.member(event.params[1] as GuildMember)];
            default: return [this.void()];
        }
    }

    /** void serializer to sympolize nothing is serialized or exists */
    static void (): SerialVoid {
        return { type: 'void' };
    }

    /**
     * Take an array of discord guilds and serialize them individually with .guild()
     * @param guilds - Array of discord guilds
     */
    static guilds (guilds: Array<Guild>): Array<SerialGuild> {
        const guildObjects: Array<SerialGuild> = [];
        if (!guilds) return guildObjects;
        guilds.forEach(guild => { guildObjects.push(this.guild(guild)); });
        return guildObjects;
    }

    /**
     * Take an array of discord channels and serialize them individually with .channel()
     * @param channels - Array of discord channels
     */
    static channels (channels: Array<TextChannel | GuildChannel>): Array<SerialChannel> {
        const channelObjects: Array<SerialChannel> = [];
        if (!channels) return channelObjects;
        channels.forEach(channel => { channelObjects.push(this.channel(channel)); });
        return channelObjects;
    }

    /**
     * Take an array of discord messages and serialize them individually with .messages()
     * @param messages - Array of discord messages
     */
    static messages (messages: Array<Message>): Array<SerialMessage> {
        const messageObjects: Array<SerialMessage> = [];
        if (!messages) return messageObjects;
        messages.forEach(messsage => { messageObjects.push(this.message(messsage)); });
        return messageObjects;
    }

    /**
     * Take an array of discord members and serialize them individually with .member()
     * @param members - Array of discord guild members
     */
    static members (members: Array<GuildMember>): Array<SerialMember> {
        const memberObjects: Array<SerialMember> = [];
        if (!members) return memberObjects;
        members.forEach(member => { memberObjects.push(this.member(member)); });
        return memberObjects;
    }

    /**
     * Serialize a single discord message into its counterpart object
     * @param message - Discord message class instance
     */
    static message (message: Message): SerialMessage {
        return {
            type: 'message',
            id: message.id,
            author: this.user(message.author),
            channel: this.channel(message.channel as TextChannel | GuildChannel),
            content: message.content,
            createdAt: message.createdAt,
            createdTimestamp: message.createdTimestamp,
            deletable: message.deletable,
            deleted: message.deleted,
            editable: message.editable,
            editedAt: message.editedAt || undefined,
            editedTimestamp: message.editedTimestamp || undefined,
        };
    }

    /**
     * Serialize a single discord user into its counterpart object
     * @param user - Discord user class instance
     */
    static user (user: User): SerialUser {
        return {
            type: 'user',
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            tag: user.tag,
            bot: user.bot,
            avatar: user.avatar || undefined,
            createdAt: user.createdAt,
            createdTimestamp: user.createdTimestamp,
            lastMessageID: user.lastMessageID || undefined

        };
    }

    /**
     * Serialize a single discord member into its counterpart object
     * @param member - Discord member class instance
     */
    static member (member: GuildMember): SerialMember {
        return {
            type: 'member',
            id: member.id,
            displayColor: member.displayColor,
            displayHexColor: member.displayHexColor,
            displayName: member.displayName,
            nickname: member.nickname || undefined,
            joinedAt: member.joinedAt || undefined,
            joinedTimestamp: member.joinedTimestamp || undefined,
            kickable: member.kickable,
            lastMessageID: member.lastMessageID || undefined,
            manageable: member.manageable,
            user: member.user ? this.user(member.user) : undefined,
            premiumSince: member.premiumSince || undefined,
            premiumSinceTimestamp: member.premiumSinceTimestamp || undefined
        };
    }

    /**
     * Serialize a single discord channel into its counterpart object
     * @param channel - Discord channel class instance
     */
    static channel (channel: TextChannel | GuildChannel): SerialChannel {
        return {
            type: 'channel',
            id: channel.id,
            name: channel.name,
            createdAt: channel.createdAt,
            createdTimestamp: channel.createdTimestamp,
            guild: channel.guild ? this.guild(channel.guild) : undefined,
            manageable: channel.manageable,
            viewable: channel.viewable,
            position: channel.rawPosition,
        };
    }

    /**
     * Serialize a single discord guild into its counterpart object
     * @param guild - Discord guild class instance
     */
    static guild (guild: Guild): SerialGuild {
        return {
            type: 'guild',
            id: guild.id,
            name: guild.name,
            ownerID: guild.ownerID,
            owner: guild.owner ? this.member(guild.owner as GuildMember) : undefined,
            createdAt: guild.createdAt,
            createdTimestamp: guild.createdTimestamp,
            deleted: guild.deleted,
            description: guild.description || undefined,
            icon: guild.icon || undefined,
            memberCount: guild.memberCount,
            region: guild.region,
        };
    }

    /**
     * Serialize a single discord emoji into its counterpart object
     * @param emoji - Discord emoji class instance
     */
    static emoji (emoji: Emoji): SerialEmoji {
        return {
            type: 'emoji',
            id: emoji.id || undefined,
            name: emoji.name,
            createdAt: emoji.createdAt || undefined,
            createdTimestamp: emoji.createdTimestamp || undefined
        };
    }

    /**
     * Serialize a single discord reaction into its counterpart object
     * @param reaction - Discord reaction class instance
     */
    static reaction (reaction: MessageReaction): SerialReaction {
        return {
            type: 'reaction',
            message: this.message(reaction.message),
            count: reaction.count || undefined,
            emoji: this.emoji(reaction.emoji),
            me: reaction.me
        };
    }

    /**
     * Serialize a single discord role into its counterpart object
     * @param role - Discord role class instance
     */
    static role (role: Role): SerialRole {
        return {
            type: 'role',
            id: role.id,
            name: role.name,
            color: role.color,
            hexColor: role.hexColor,
            position: role.rawPosition,
            createdAt: role.createdAt,
            createdTimestamp: role.createdTimestamp,
            deleted: role.deleted,
            mentionable: role.mentionable,
            guild: this.guild(role.guild),
            managed: role.managed,
            editable: role.editable,
            hoist: role.hoist,
            permissions: this.permissions(role.permissions as Permissions),
        };
    }

    /**
     * Serialize a single discord presence into its counterpart object
     * @param presence - Discord presence class instance
     */
    static presence (presence: Presence): SerialPresence {
        return {
            type: 'presence',
            status: presence.status,
            clientStatus: presence.clientStatus || undefined,
            activities: this.activity(presence.activities),
            guild: presence.guild ? this.guild(presence.guild) : undefined,
            member: presence.member ? this.member(presence.member) : undefined
        };
    }

    /**
     * Serialize an array of discord activity into an array of objects
     * @param activities - Array of discord activities
     */
    static activity (activities: Array<Activity>): Array<SerialActivity> {
        const activityArray: Array<SerialActivity> = [];
        if (!activities) return activityArray;
        activities.forEach(activity => {
            activityArray.push({
                type: 'activity',
                applicationID: activity.applicationID || undefined,
                createdAt: activity.createdAt,
                details: activity.details || undefined,
                emoji: activity.emoji ? this.emoji(activity.emoji) : undefined,
                state: activity.state || undefined,
                timestamps: {
                    start: activity.timestamps?.start || undefined,
                    end:  activity.timestamps?.end || undefined
                },
                name: activity.name,
                url: activity.url || undefined
            });
        });

        return activityArray;
    }

    /**
     * Serialize a single discord permissions into an array of permission flags
     * @param permissions - Discord permissions class instance
     */
    static permissions (permissions: Permissions): Array<SerialPermissions> {
        const permissionsArray: Array<SerialPermissions> = [];
        if (!permissions) return permissionsArray;
        Object.keys(Permissions.FLAGS).forEach(flag => { if (permissions.has(flag as PermissionString)) permissionsArray.push(flag as PermissionString); });
        return permissionsArray;
    }
}